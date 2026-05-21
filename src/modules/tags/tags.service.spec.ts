import { BadRequestException } from '@nestjs/common';
import { TagsService } from './tags.service';

describe('TagsService', () => {
    let prisma: any;
    let service: TagsService;

    const tag = { id: 'tag-1', name: 'Tech', slug: 'tech' };

    beforeEach(() => {
        prisma = {
            tag: {
                create: jest.fn(),
                findMany: jest.fn(),
                findUnique: jest.fn(),
                update: jest.fn(),
                delete: jest.fn(),
            },
            post: { findFirst: jest.fn() },
            project: { findFirst: jest.fn() },
            vacancy: { findFirst: jest.fn() },
            postTag: { upsert: jest.fn(), delete: jest.fn() },
            projectTag: { upsert: jest.fn(), delete: jest.fn() },
            vacancyTag: { upsert: jest.fn(), delete: jest.fn() },
        };
        service = new TagsService(prisma);
    });

    it('creates tag with unique slug', async () => {
        prisma.tag.findUnique.mockResolvedValue(null);
        prisma.tag.create.mockResolvedValue(tag);

        await expect(service.create({ name: tag.name, slug: tag.slug })).resolves.toEqual(tag);
    });

    it('rejects duplicate slug', async () => {
        prisma.tag.findUnique.mockResolvedValue(tag);

        await expect(service.create({ name: tag.name, slug: tag.slug })).rejects.toBeInstanceOf(
            BadRequestException,
        );
    });

    it('attaches tag to post', async () => {
        prisma.tag.findUnique.mockResolvedValue(tag);
        prisma.post.findFirst.mockResolvedValue({ id: 'post-1' });
        prisma.postTag.upsert.mockResolvedValue({ postId: 'post-1', tagId: tag.id });

        await expect(
            service.attach({ entityType: 'post', entityId: 'post-1', tagId: tag.id }),
        ).resolves.toEqual({ postId: 'post-1', tagId: tag.id });
    });
});
