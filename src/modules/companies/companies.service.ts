import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Locale } from '@prisma/client';
import { PrismaService } from '../../database/prisma/prisma.service';
import { localizeEntity, localizeEntities } from '../../common/utils/translation.util';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompaniesService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly eventEmitter: EventEmitter2,
    ) {}

    async create(user: any, dto: CreateCompanyDto, req?: any) {
        const { translations, ...companyData } = dto;
        await this.ensureSlugAvailable(dto.slug);

        const company = await this.prisma.$transaction(async (tx) => {
            const created = await tx.company.create({
                data: {
                    ...companyData,
                    ...(translations?.length
                        ? { translations: { create: translations } }
                        : {}),
                },
                ...(translations?.length
                    ? { include: { translations: true } }
                    : {}),
            });

            await tx.companyMember.create({
                data: {
                    companyId: created.id,
                    userId: user.sub,
                    isOwner: true,
                },
            });

            return created;
        });

        this.eventEmitter.emit('company.created', {
            user,
            company,
            req,
        });

        return company;
    }

    async findAll(locale?: Locale) {
        const companies = await this.prisma.company.findMany({
            where: { deletedAt: null },
            include: { translations: true },
            orderBy: { createdAt: 'desc' },
        });

        return localizeEntities(companies, locale);
    }

    async findOneBySlug(slug: string, locale?: Locale) {
        const company = await this.prisma.company.findFirst({
            where: {
                slug,
                deletedAt: null,
            },
            include: { translations: true },
        });

        if (!company) {
            throw new NotFoundException('Company not found');
        }

        return localizeEntity(company, locale);
    }

    async update(id: string, user: any, dto: UpdateCompanyDto, req?: any) {
        const { translations, ...companyData } = dto;
        const company = await this.prisma.company.findUnique({
            where: { id },
            include: { translations: true },
        });

        if (!company || company.deletedAt) {
            throw new NotFoundException('Company not found');
        }

        if (dto.slug && dto.slug !== company.slug) {
            await this.ensureSlugAvailable(dto.slug, id);
        }

        const updated = await this.prisma.company.update({
            where: { id },
            data: companyData,
        });

        await this.upsertTranslations(id, translations);

        this.eventEmitter.emit('company.updated', {
            user,
            before: company,
            after: updated,
            req,
        });

        return updated;
    }

    async remove(id: string, user: any, req?: any) {
        const company = await this.prisma.company.findUnique({
            where: { id },
        });

        if (!company || company.deletedAt) {
            throw new NotFoundException('Company not found');
        }

        const deleted = await this.prisma.company.update({
            where: { id },
            data: {
                deletedAt: new Date(),
            },
        });

        this.eventEmitter.emit('company.deleted', {
            user,
            company: deleted,
            req,
        });

        return { success: true };
    }

    private async ensureSlugAvailable(slug: string, currentCompanyId?: string) {
        const company = await this.prisma.company.findUnique({
            where: { slug },
            select: { id: true },
        });

        if (company && company.id !== currentCompanyId) {
            throw new BadRequestException('Company slug already in use');
        }
    }

    private async upsertTranslations(
        companyId: string,
        translations?: CreateCompanyDto['translations'],
    ) {
        if (!translations) return;

        await Promise.all(
            translations.map((translation) =>
                this.prisma.companyTranslation.upsert({
                    where: {
                        companyId_locale: {
                            companyId,
                            locale: translation.locale,
                        },
                    },
                    update: translation,
                    create: { ...translation, companyId },
                }),
            ),
        );
    }
}
