import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Locale } from '@prisma/client';
import { resolveTranslation } from '../../common/utils/translation.util';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateAdDto } from './dto/create-ad.dto';
import { CreateAdPlacementDto } from './dto/create-ad-placement.dto';
import { CreateAdSpaceDto } from './dto/create-ad-space.dto';
import { UpdateAdDto } from './dto/update-ad.dto';
import { UpdateAdSpaceDto } from './dto/update-ad-space.dto';

@Injectable()
export class AdsService {
    constructor(private readonly prisma: PrismaService) {}

    async findForCompanySite(companySlug: string, locationKey?: string, locale?: Locale) {
        const company = await this.prisma.company.findFirst({
            where: { slug: companySlug, deletedAt: null },
            select: { id: true },
        });
        if (!company) throw new NotFoundException('Company not found');

        const now = new Date();
        const placements = await this.prisma.adPlacement.findMany({
            where: {
                deletedAt: null,
                OR: [{ companyId: null }, { companyId: company.id }],
                space: {
                    deletedAt: null,
                    ...(locationKey ? { locationKey } : {}),
                    OR: [{ companyId: null }, { companyId: company.id }],
                },
                ad: {
                    deletedAt: null,
                    isActive: true,
                    OR: [{ isGlobal: true }, { companyId: company.id }],
                    AND: [
                        { OR: [{ startDate: null }, { startDate: { lte: now } }] },
                        { OR: [{ endDate: null }, { endDate: { gte: now } }] },
                    ],
                },
            },
            include: { ad: { include: { translations: true } }, space: true },
            orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        });

        return placements.map((placement) => ({
            ...placement,
            ad: placement.ad
                ? {
                      ...placement.ad,
                      translation: resolveTranslation(
                          placement.ad.translations,
                          locale,
                      ),
                  }
                : undefined,
        }));
    }

    async createSpace(dto: CreateAdSpaceDto) {
        await this.ensureCompany(dto.companyId);
        return this.prisma.adSpace.create({ data: dto });
    }

    async updateSpace(id: string, dto: UpdateAdSpaceDto) {
        await this.findActiveSpace(id);
        await this.ensureCompany(dto.companyId);
        return this.prisma.adSpace.update({ where: { id }, data: dto });
    }

    async removeSpace(id: string) {
        await this.findActiveSpace(id);
        await this.prisma.adSpace.update({ where: { id }, data: { deletedAt: new Date() } });
        return { success: true };
    }

    async createAd(dto: CreateAdDto) {
        const { translations, ...adData } = dto;
        await this.validateAdScope(dto.isGlobal ?? false, dto.companyId);
        return this.prisma.ad.create({
            data: {
                ...adData,
                companyId: dto.isGlobal ? null : dto.companyId,
                startDate: dto.startDate ? new Date(dto.startDate) : undefined,
                endDate: dto.endDate ? new Date(dto.endDate) : undefined,
                ...(translations?.length
                    ? { translations: { create: translations } }
                    : {}),
            },
            ...(translations?.length ? { include: { translations: true } } : {}),
        });
    }

    async updateAd(id: string, dto: UpdateAdDto) {
        const { translations, ...adData } = dto;
        const ad = await this.findActiveAd(id);
        const nextIsGlobal = dto.isGlobal ?? ad.isGlobal;
        const nextCompanyId = dto.companyId !== undefined ? dto.companyId : ad.companyId;
        await this.validateAdScope(nextIsGlobal, nextCompanyId);

        const updated = await this.prisma.ad.update({
            where: { id },
            data: {
                ...adData,
                companyId: nextIsGlobal ? null : nextCompanyId,
                startDate: dto.startDate ? new Date(dto.startDate) : undefined,
                endDate: dto.endDate ? new Date(dto.endDate) : undefined,
            },
            include: { translations: true },
        });

        await this.upsertTranslations(id, translations);
        return updated;
    }

    async removeAd(id: string) {
        await this.findActiveAd(id);
        await this.prisma.ad.update({ where: { id }, data: { deletedAt: new Date() } });
        return { success: true };
    }

    async createPlacement(dto: CreateAdPlacementDto) {
        await Promise.all([
            this.findActiveAd(dto.adId),
            this.findActiveSpace(dto.spaceId),
            this.ensureCompany(dto.companyId),
        ]);
        return this.prisma.adPlacement.create({ data: dto });
    }

    async trackImpression(id: string) {
        await this.findActivePlacement(id);

        return this.prisma.adPlacement.update({
            where: { id },
            data: { impressions: { increment: 1 } },
        });
    }

    async trackClick(id: string) {
        await this.findActivePlacement(id);

        return this.prisma.adPlacement.update({
            where: { id },
            data: { clicks: { increment: 1 } },
        });
    }

    private async validateAdScope(isGlobal: boolean, companyId?: string | null) {
        if (isGlobal && companyId) throw new BadRequestException('Global ad cannot have companyId');
        if (!isGlobal && !companyId) throw new BadRequestException('Company ad requires companyId');
        await this.ensureCompany(companyId);
    }

    private async ensureCompany(companyId?: string | null) {
        if (!companyId) return;
        const company = await this.prisma.company.findUnique({
            where: { id: companyId },
            select: { id: true, deletedAt: true },
        });
        if (!company || company.deletedAt) throw new NotFoundException('Company not found');
    }

    private async findActiveAd(id: string) {
        const ad = await this.prisma.ad.findUnique({ where: { id } });
        if (!ad || ad.deletedAt) throw new NotFoundException('Ad not found');
        return ad;
    }

    private async findActiveSpace(id: string) {
        const space = await this.prisma.adSpace.findUnique({ where: { id } });
        if (!space || space.deletedAt) throw new NotFoundException('Ad space not found');
        return space;
    }

    private async findActivePlacement(id: string) {
        const placement = await this.prisma.adPlacement.findUnique({
            where: { id },
            select: { id: true },
        });
        if (!placement) throw new NotFoundException('Ad placement not found');
        return placement;
    }

    private async upsertTranslations(
        adId: string,
        translations?: CreateAdDto['translations'],
    ) {
        if (!translations) return;

        await Promise.all(
            translations.map((translation) =>
                this.prisma.adTranslation.upsert({
                    where: {
                        adId_locale: {
                            adId,
                            locale: translation.locale,
                        },
                    },
                    update: translation,
                    create: { ...translation, adId },
                }),
            ),
        );
    }
}
