import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PostStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly eventEmitter: EventEmitter2,
    ) {}

    async create(user: any, dto: CreatePostDto, req?: any) {
        await this.ensureSlugAvailable(dto.slug);
        await this.validateScope(dto.isGlobal ?? false, dto.companyId);

        const post = await this.prisma.post.create({
            data: {
                ...dto,
                companyId: dto.isGlobal ? null : dto.companyId,
                createdBy: user.sub,
                publishedAt:
                    dto.status === PostStatus.PUBLISHED ? new Date() : null,
            },
        });

        this.eventEmitter.emit('post.created', { user, post, req });

        return post;
    }

    async findForCompanySite(companySlug: string) {
        const company = await this.prisma.company.findFirst({
            where: { slug: companySlug, deletedAt: null },
            select: { id: true },
        });

        if (!company) {
            throw new NotFoundException('Company not found');
        }

        return this.prisma.post.findMany({
            where: {
                deletedAt: null,
                status: PostStatus.PUBLISHED,
                OR: [{ isGlobal: true }, { companyId: company.id }],
            },
            orderBy: [
                { sortOrder: 'asc' },
                { publishedAt: 'desc' },
                { createdAt: 'desc' },
            ],
        });
    }

    async findAllAdmin() {
        return this.prisma.post.findMany({
            where: { deletedAt: null },
            include: {
                company: true,
                author: {
                    select: { id: true, name: true, email: true },
                },
            },
            orderBy: [{ createdAt: 'desc' }],
        });
    }

    async update(id: string, user: any, dto: UpdatePostDto, req?: any) {
        const post = await this.findActivePost(id);
        const nextIsGlobal = dto.isGlobal ?? post.isGlobal;
        const nextCompanyId =
            dto.companyId !== undefined ? dto.companyId : post.companyId;

        if (dto.slug && dto.slug !== post.slug) {
            await this.ensureSlugAvailable(dto.slug, id);
        }

        await this.validateScope(nextIsGlobal, nextCompanyId);

        const updated = await this.prisma.post.update({
            where: { id },
            data: {
                ...dto,
                companyId: nextIsGlobal ? null : nextCompanyId,
                publishedAt: this.resolvePublishedAt(post.status, dto.status, post.publishedAt),
            },
        });

        this.eventEmitter.emit('post.updated', {
            user,
            before: post,
            after: updated,
            req,
        });

        return updated;
    }

    async publish(id: string, user: any, req?: any) {
        const post = await this.findActivePost(id);

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
}
