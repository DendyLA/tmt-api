import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';

@Injectable()
export class MediaService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly eventEmitter: EventEmitter2,
    ) {}

    async create(user: any, dto: CreateMediaDto, req?: any) {
        await this.validateScope(dto.isGlobal ?? false, dto.companyId);

        const media = await this.prisma.media.create({
            data: {
                ...dto,
                companyId: dto.isGlobal ? null : dto.companyId,
                createdBy: user.sub,
            },
        });

        this.eventEmitter.emit('media.created', { user, media, req });
        return media;
    }

    async findForCompanySite(companySlug: string) {
        const company = await this.prisma.company.findFirst({
            where: { slug: companySlug, deletedAt: null },
            select: { id: true },
        });

        if (!company) throw new NotFoundException('Company not found');

        return this.prisma.media.findMany({
            where: {
                deletedAt: null,
                OR: [{ isGlobal: true }, { companyId: company.id }],
            },
            orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        });
    }

    async findAllAdmin() {
        return this.prisma.media.findMany({
            where: { deletedAt: null },
            include: {
                company: true,
                author: { select: { id: true, name: true, email: true } },
            },
            orderBy: [{ createdAt: 'desc' }],
        });
    }

    async update(id: string, user: any, dto: UpdateMediaDto, req?: any) {
        const media = await this.findActiveMedia(id);
        const nextIsGlobal = dto.isGlobal ?? media.isGlobal;
        const nextCompanyId =
            dto.companyId !== undefined ? dto.companyId : media.companyId;

        await this.validateScope(nextIsGlobal, nextCompanyId);

        const updated = await this.prisma.media.update({
            where: { id },
            data: {
                ...dto,
                companyId: nextIsGlobal ? null : nextCompanyId,
            },
        });

        this.eventEmitter.emit('media.updated', {
            user,
            before: media,
            after: updated,
            req,
        });

        return updated;
    }

    async remove(id: string, user: any, req?: any) {
        const media = await this.findActiveMedia(id);

        const deleted = await this.prisma.media.update({
            where: { id },
            data: { deletedAt: new Date() },
        });

        this.eventEmitter.emit('media.deleted', { user, media: deleted, req });
        return { success: true };
    }

    private async findActiveMedia(id: string) {
        const media = await this.prisma.media.findUnique({ where: { id } });
        if (!media || media.deletedAt) throw new NotFoundException('Media not found');
        return media;
    }

    private async validateScope(isGlobal: boolean, companyId?: string | null) {
        if (isGlobal && companyId) {
            throw new BadRequestException('Global media cannot have companyId');
        }

        if (!isGlobal && !companyId) {
            throw new BadRequestException('Company media requires companyId');
        }

        if (!companyId) return;

        const company = await this.prisma.company.findUnique({
            where: { id: companyId },
            select: { id: true, deletedAt: true },
        });

        if (!company || company.deletedAt) throw new NotFoundException('Company not found');
    }
}
