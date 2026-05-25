import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PostStatus, PostType } from '@prisma/client';
import { PostsService } from './posts.service';

describe('PostsService', () => {
    let prisma: any;
    let eventEmitter: { emit: jest.Mock };
    let contentVersions: { createVersion: jest.Mock; findOne: jest.Mock };
    let service: PostsService;

    const user = { sub: 'user-1' };
    const company = { id: 'company-1', slug: 'company', deletedAt: null };
    const post = {
        id: 'post-1',
        companyId: company.id,
        createdBy: user.sub,
        title: 'Company post',
        slug: 'company-post',
        excerpt: null,
        content: 'Company post content',
        type: PostType.NEWS,
        status: PostStatus.DRAFT,
        isGlobal: false,
        sortOrder: 0,
        publishedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
    };

    beforeEach(() => {
        prisma = {
            company: {
                findFirst: jest.fn(),
                findUnique: jest.fn(),
            },
            post: {
                create: jest.fn(),
                findMany: jest.fn(),
                count: jest.fn(),
                findUnique: jest.fn(),
                update: jest.fn(),
            },
        };

        eventEmitter = { emit: jest.fn() };
        contentVersions = {
            createVersion: jest.fn(),
            findOne: jest.fn(),
        };
        service = new PostsService(
            prisma,
            eventEmitter as any,
            contentVersions as any,
        );
    });

    it('creates company-scoped post', async () => {
        prisma.post.findUnique.mockResolvedValue(null);
        prisma.company.findUnique.mockResolvedValue(company);
        prisma.post.create.mockResolvedValue(post);

        await expect(
            service.create(user, {
                companyId: company.id,
                title: post.title,
                slug: post.slug,
                content: post.content,
            }),
        ).resolves.toEqual(post);

        expect(prisma.post.create).toHaveBeenCalledWith({
            data: {
                companyId: company.id,
                title: post.title,
                slug: post.slug,
                content: post.content,
                createdBy: user.sub,
                publishedAt: null,
            },
        });
        expect(eventEmitter.emit).toHaveBeenCalledWith('post.created', {
            user,
            post,
            req: undefined,
        });
    });

    it('creates global published post without company', async () => {
        const globalPost = {
            ...post,
            companyId: null,
            isGlobal: true,
            status: PostStatus.PUBLISHED,
            publishedAt: new Date(),
        };

        prisma.post.findUnique.mockResolvedValue(null);
        prisma.post.create.mockResolvedValue(globalPost);

        await expect(
            service.create(user, {
                isGlobal: true,
                title: globalPost.title,
                slug: globalPost.slug,
                content: globalPost.content,
                status: PostStatus.PUBLISHED,
            }),
        ).resolves.toEqual(globalPost);

        expect(prisma.company.findUnique).not.toHaveBeenCalled();
        expect(prisma.post.create).toHaveBeenCalledWith({
            data: expect.objectContaining({
                companyId: null,
                isGlobal: true,
                status: PostStatus.PUBLISHED,
                publishedAt: expect.any(Date),
            }),
        });
    });

    it('rejects invalid post scope', async () => {
        prisma.post.findUnique.mockResolvedValue(null);

        await expect(
            service.create(user, {
                isGlobal: true,
                companyId: company.id,
                title: post.title,
                slug: post.slug,
                content: post.content,
            }),
        ).rejects.toBeInstanceOf(BadRequestException);

        await expect(
            service.create(user, {
                title: post.title,
                slug: post.slug,
                content: post.content,
            }),
        ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('finds published global and company posts for company site', async () => {
        prisma.company.findFirst.mockResolvedValue(company);
        prisma.post.findMany.mockResolvedValue([post]);
        prisma.post.count.mockResolvedValue(1);

        await expect(service.findForCompanySite(company.slug)).resolves.toEqual({
            data: [post],
            meta: { total: 1, page: 1, limit: 20, pages: 1 },
        });

        expect(prisma.post.findMany).toHaveBeenCalledWith({
            where: {
                deletedAt: null,
                status: PostStatus.PUBLISHED,
                AND: [
                    { OR: [{ isGlobal: true }, { companyId: company.id }] },
                ],
            },
            include: {
                translations: true,
                tags: { include: { tag: true } },
            },
            orderBy: [
                { sortOrder: 'asc' },
                { publishedAt: 'desc' },
                { createdAt: 'desc' },
            ],
            skip: 0,
            take: 20,
        });
    });

    it('publishes post', async () => {
        const published = {
            ...post,
            status: PostStatus.PUBLISHED,
            publishedAt: new Date(),
        };

        prisma.post.findUnique.mockResolvedValue(post);
        prisma.post.update.mockResolvedValue(published);

        await expect(service.publish(post.id, user)).resolves.toEqual(
            published,
        );

        expect(prisma.post.update).toHaveBeenCalledWith({
            where: { id: post.id },
            data: {
                status: PostStatus.PUBLISHED,
                publishedAt: expect.any(Date),
            },
        });
    });

    it('soft deletes post', async () => {
        prisma.post.findUnique.mockResolvedValue(post);
        prisma.post.update.mockResolvedValue({ ...post, deletedAt: new Date() });

        await expect(service.remove(post.id, user)).resolves.toEqual({
            success: true,
        });
    });

    it('throws when post is missing', async () => {
        prisma.post.findUnique.mockResolvedValue(null);

        await expect(service.publish('missing', user)).rejects.toBeInstanceOf(
            NotFoundException,
        );
    });
});
