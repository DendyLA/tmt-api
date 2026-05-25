import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Locale, PostStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma/prisma.service';
import {
    getPagination,
    paginatedResponse,
    PaginationQueryDto,
} from '../../common/dto/pagination-query.dto';
import { ContentVersionsService } from '../content-versions/content-versions.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { localizeEntity, localizeEntities } from '../../common/utils/translation.util';

@Injectable()
export class PostsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly eventEmitter: EventEmitter2,
        private readonly contentVersions: ContentVersionsService,
    ) {}

    async create(user: any, dto: CreatePostDto, req?: any) {
        const { translations, ...postData } = dto;
        await this.ensureSlugAvailable(dto.slug);
        await this.validateScope(dto.isGlobal ?? false, dto.companyId);

        const post = await this.prisma.post.create({
            data: {
                ...postData,
                companyId: dto.isGlobal ? null : dto.companyId,
                createdBy: user.sub,
                publishedAt:
                    dto.status === PostStatus.PUBLISHED ? new Date() : null,
                ...(translations?.length
                    ? { translations: { create: translations } }
                    : {}),
            },
            ...(translations?.length ? { include: { translations: true } } : {}),
        });

        this.eventEmitter.emit('post.created', { user, post, req });

        return post;
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

        if (!company) {
            throw new NotFoundException('Company not found');
        }

        const { page, limit, skip, take } = getPagination(query);
        const where: Prisma.PostWhereInput = {
            deletedAt: null,
            status: PostStatus.PUBLISHED,
            AND: [
                { OR: [{ isGlobal: true }, { companyId: company.id }] },
                ...(query.search ? [this.buildSearchFilter(query.search)] : []),
            ],
            ...(tagSlug ? this.buildTagFilter(tagSlug) : {}),
        };

        const [data, total] = await Promise.all([
            this.prisma.post.findMany({
                where,
                include: {
                    translations: true,
                    tags: { include: { tag: true } },
                },
                orderBy: [
                    { sortOrder: 'asc' },
                    { publishedAt: 'desc' },
                    { createdAt: 'desc' },
                ],
                skip,
                take,
            }),
            this.prisma.post.count({ where }),
        ]);

        return paginatedResponse(
            localizeEntities(data, query.locale),
            total,
            page,
            limit,
        );
    }

    async findOneForCompanySite(
        companySlug: string,
        postSlug: string,
        locale?: Locale,
    ) {
        const company = await this.prisma.company.findFirst({
            where: { slug: companySlug, deletedAt: null },
            select: { id: true },
        });

        if (!company) {
            throw new NotFoundException('Company not found');
        }

        const post = await this.prisma.post.findFirst({
            where: {
                slug: postSlug,
                deletedAt: null,
                status: PostStatus.PUBLISHED,
                OR: [{ isGlobal: true }, { companyId: company.id }],
            },
            include: {
                company: true,
                translations: true,
                tags: { include: { tag: true } },
            },
        });

        if (!post) {
            throw new NotFoundException('Post not found');
        }

        return localizeEntity(post, locale);
    }

    async findAllAdmin(query: PaginationQueryDto = {}) {
        const { page, limit, skip, take } = getPagination(query);
        const where: Prisma.PostWhereInput = {
            deletedAt: null,
            ...(query.search ? this.buildSearchFilter(query.search) : {}),
        };

        const [data, total] = await Promise.all([
            this.prisma.post.findMany({
                where,
                include: {
                company: true,
                author: {
                    select: { id: true, name: true, email: true },
                },
                translations: true,
                tags: { include: { tag: true } },
                },
                orderBy: [{ createdAt: 'desc' }],
                skip,
                take,
            }),
            this.prisma.post.count({ where }),
        ]);

        return paginatedResponse(data, total, page, limit);
    }

    async update(id: string, user: any, dto: UpdatePostDto, req?: any) {
        const { translations, ...postData } = dto;
        const post = await this.findActivePostWithTranslations(id);
        const nextIsGlobal = dto.isGlobal ?? post.isGlobal;
        const nextCompanyId =
            dto.companyId !== undefined ? dto.companyId : post.companyId;

        if (dto.slug && dto.slug !== post.slug) {
            await this.ensureSlugAvailable(dto.slug, id);
        }

        await this.validateScope(nextIsGlobal, nextCompanyId);
        await this.contentVersions.createVersion('post', post.id, post, user.sub);

        const updated = await this.prisma.post.update({
            where: { id },
            data: {
                ...postData,
                companyId: nextIsGlobal ? null : nextCompanyId,
                publishedAt: this.resolvePublishedAt(post.status, dto.status, post.publishedAt),
            },
            include: { translations: true },
        });

        await this.upsertTranslations(id, translations);

        this.eventEmitter.emit('post.updated', {
            user,
            before: post,
            after: updated,
            req,
        });

        return this.findActivePostWithTranslations(id);
    }

    async publish(id: string, user: any, req?: any) {
        const post = await this.findActivePostWithTranslations(id);
        await this.contentVersions.createVersion('post', post.id, post, user.sub);

        const updated = await this.prisma.post.update({
            where: { id },
            data: {
                status: PostStatus.PUBLISHED,
                publishedAt: post.publishedAt ?? new Date(),
            },
        });

        this.eventEmitter.emit('post.published', {
            user,
            before: post,
            after: updated,
            req,
        });

        return updated;
    }

    async rollback(id: string, versionId: string, user: any, req?: any) {
        const post = await this.findActivePostWithTranslations(id);
        const version = await this.contentVersions.findOne(versionId);

        if (version.entityType !== 'post' || version.entityId !== id) {
            throw new BadRequestException('Version does not belong to post');
        }

        await this.contentVersions.createVersion('post', post.id, post, user.sub);

        const data = version.data as any;
        const translations = data.translations ?? [];
        await this.prisma.postTranslation.deleteMany({ where: { postId: id } });
        const updated = await this.prisma.post.update({
            where: { id },
            data: {
                companyId: data.companyId,
                title: data.title,
                slug: data.slug,
                excerpt: data.excerpt,
                content: data.content,
                type: data.type,
                status: data.status,
                isGlobal: data.isGlobal,
                sortOrder: data.sortOrder,
                publishedAt: data.publishedAt,
                deletedAt: data.deletedAt,
                translations: translations.length
                    ? {
                          create: translations.map((item: any) => ({
                              locale: item.locale,
                              title: item.title,
                              excerpt: item.excerpt,
                              content: item.content,
                          })),
                      }
                    : undefined,
            },
            include: { translations: true },
        });

        this.eventEmitter.emit('post.rollback', {
            user,
            before: post,
            after: updated,
            version,
            req,
        });

        return updated;
    }

    async remove(id: string, user: any, req?: any) {
        const post = await this.findActivePost(id);

        const deleted = await this.prisma.post.update({
            where: { id },
            data: { deletedAt: new Date() },
        });

        this.eventEmitter.emit('post.deleted', {
            user,
            post: deleted,
            req,
        });

        return { success: true };
    }

    private async findActivePost(id: string) {
        const post = await this.prisma.post.findUnique({ where: { id } });

        if (!post || post.deletedAt) {
            throw new NotFoundException('Post not found');
        }

        return post;
    }

    private async findActivePostWithTranslations(id: string) {
        const post = await this.prisma.post.findUnique({
            where: { id },
            include: { translations: true },
        });

        if (!post || post.deletedAt) {
            throw new NotFoundException('Post not found');
        }

        return post;
    }

    private async upsertTranslations(
        postId: string,
        translations?: CreatePostDto['translations'],
    ) {
        if (!translations) return;

        await Promise.all(
            translations.map((translation) =>
                this.prisma.postTranslation.upsert({
                    where: {
                        postId_locale: {
                            postId,
                            locale: translation.locale,
                        },
                    },
                    update: translation,
                    create: { ...translation, postId },
                }),
            ),
        );
    }

    private async ensureSlugAvailable(slug: string, currentPostId?: string) {
        const post = await this.prisma.post.findUnique({
            where: { slug },
            select: { id: true },
        });

        if (post && post.id !== currentPostId) {
            throw new BadRequestException('Post slug already in use');
        }
    }

    private async validateScope(isGlobal: boolean, companyId?: string | null) {
        if (isGlobal && companyId) {
            throw new BadRequestException('Global post cannot have companyId');
        }

        if (!isGlobal && !companyId) {
            throw new BadRequestException('Company post requires companyId');
        }

        if (!companyId) return;

        const company = await this.prisma.company.findUnique({
            where: { id: companyId },
            select: { id: true, deletedAt: true },
        });

        if (!company || company.deletedAt) {
            throw new NotFoundException('Company not found');
        }
    }

    private resolvePublishedAt(
        currentStatus: PostStatus,
        nextStatus?: PostStatus,
        currentPublishedAt?: Date | null,
    ) {
        if (nextStatus !== PostStatus.PUBLISHED) {
            return currentPublishedAt;
        }

        if (currentStatus === PostStatus.PUBLISHED && currentPublishedAt) {
            return currentPublishedAt;
        }

        return new Date();
    }

    private buildTagFilter(tagSlug: string): Prisma.PostWhereInput {
        return {
            tags: {
                some: {
                    tag: { slug: tagSlug },
                },
            },
        };
    }

    private buildSearchFilter(search: string): Prisma.PostWhereInput {
        return {
            OR: [
                { title: { contains: search, mode: 'insensitive' } },
                { excerpt: { contains: search, mode: 'insensitive' } },
                { content: { contains: search, mode: 'insensitive' } },
            ],
        };
    }
}
