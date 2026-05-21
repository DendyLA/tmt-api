import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma/prisma.service';
import {
    getPagination,
    paginatedResponse,
    PaginationQueryDto,
} from '../../common/dto/pagination-query.dto';
import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import { UploadMediaDto } from './dto/upload-media.dto';
import { LocalMediaStorageService } from './storage/local-media-storage.service';

@Injectable()
export class MediaService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly eventEmitter: EventEmitter2,
        private readonly storage: LocalMediaStorageService,
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

    async upload(user: any, file: any, dto: UploadMediaDto, req?: any) {
        await this.validateScope(dto.isGlobal ?? false, dto.companyId);

        const storedFile = await this.storage.save(file);
        const media = await this.prisma.media.create({
            data: {
                companyId: dto.isGlobal ? null : dto.companyId,
                url: storedFile.url,
                type: storedFile.type,
                entityType: dto.entityType,
                entityId: dto.entityId,
                isGlobal: dto.isGlobal ?? false,
                altText: dto.altText,
                title: dto.title,
                sortOrder: dto.sortOrder,
                createdBy: user.sub,
            },
        });

        this.eventEmitter.emit('media.created', {
            user,
            media,
            req,
            file: storedFile,
        });

        return media;
    }

    async findForCompanySite(
        companySlug: string,
        tagSlug?: string,
        query: PaginationQueryDto = {},
    ) {
        const company = await this.prisma.company.findFirst({
            where: { slug: companySlug, deletedAt: null },
            select: { id: true },
        });

        if (!company) throw new NotFoundException('Company not found');

        const tagFilter = tagSlug
            ? await this.buildTaggedMediaEntityFilter(tagSlug)
            : undefined;

        const { page, limit, skip, take } = getPagination(query);
        const where: Prisma.MediaWhereInput = {
            deletedAt: null,
            AND: [
                { OR: [{ isGlobal: true }, { companyId: company.id }] },
                ...(tagFilter ? [{ OR: tagFilter }] : []),
                ...(query.search ? [this.buildSearchFilter(query.search)] : []),
            ],
        };

        const [data, total] = await Promise.all([
            this.prisma.media.findMany({
                where,
                orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
                skip,
                take,
            }),
            this.prisma.media.count({ where }),
        ]);

        return paginatedResponse(data, total, page, limit);
    }

    async findAllAdmin(query: PaginationQueryDto = {}) {
        const { page, limit, skip, take } = getPagination(query);
        const where: Prisma.MediaWhereInput = {
            deletedAt: null,
            ...(query.search ? this.buildSearchFilter(query.search) : {}),
        };

        const [data, total] = await Promise.all([
            this.prisma.media.findMany({
                where,
                include: {
                    company: true,
                    author: { select: { id: true, name: true, email: true } },
                },
                orderBy: [{ createdAt: 'desc' }],
                skip,
                take,
            }),
            this.prisma.media.count({ where }),
        ]);

        return paginatedResponse(data, total, page, limit);
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

    private async buildTaggedMediaEntityFilter(
        tagSlug: string,
    ): Promise<Prisma.MediaWhereInput[]> {
        const [posts, projects, vacancies] = await Promise.all([
            this.prisma.postTag.findMany({
                where: { tag: { slug: tagSlug } },
                select: { postId: true },
            }),
            this.prisma.projectTag.findMany({
                where: { tag: { slug: tagSlug } },
                select: { projectId: true },
            }),
            this.prisma.vacancyTag.findMany({
                where: { tag: { slug: tagSlug } },
                select: { vacancyId: true },
            }),
        ]);

        const filters: Prisma.MediaWhereInput[] = [
            ...(posts.length
                ? [
                      {
                          entityType: 'post',
                          entityId: { in: posts.map(({ postId }) => postId) },
                      },
                  ]
                : []),
            ...(projects.length
                ? [
                      {
                          entityType: 'project',
                          entityId: {
                              in: projects.map(({ projectId }) => projectId),
                          },
                      },
                  ]
                : []),
            ...(vacancies.length
                ? [
                      {
                          entityType: 'vacancy',
                          entityId: {
                              in: vacancies.map(({ vacancyId }) => vacancyId),
                          },
                      },
                  ]
                : []),
        ];

        return filters.length ? filters : [{ id: '__tag_not_found__' }];
    }

    private buildSearchFilter(search: string): Prisma.MediaWhereInput {
        return {
            OR: [
                { title: { contains: search, mode: 'insensitive' } },
                { altText: { contains: search, mode: 'insensitive' } },
                { url: { contains: search, mode: 'insensitive' } },
            ],
        };
    }
}
