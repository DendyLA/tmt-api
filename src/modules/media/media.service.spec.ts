import { BadRequestException } from '@nestjs/common';
import { MediaType } from '@prisma/client';
import { MediaService } from './media.service';

describe('MediaService', () => {
    let prisma: any;
    let eventEmitter: { emit: jest.Mock };
    let storage: { save: jest.Mock };
    let service: MediaService;

    const user = { sub: 'user-1' };
    const company = { id: 'company-1', slug: 'company', deletedAt: null };
    const media = {
        id: 'media-1',
        companyId: company.id,
        createdBy: user.sub,
        url: 'https://cdn.tmt.tm/image.jpg',
        type: MediaType.IMAGE,
        isGlobal: false,
        deletedAt: null,
    };

    beforeEach(() => {
        prisma = {
            company: { findFirst: jest.fn(), findUnique: jest.fn() },
            media: {
                create: jest.fn(),
                findMany: jest.fn(),
                count: jest.fn(),
                findUnique: jest.fn(),
                update: jest.fn(),
            },
        };
        eventEmitter = { emit: jest.fn() };
        storage = { save: jest.fn() };
        service = new MediaService(prisma, eventEmitter as any, storage as any);
    });

    it('creates company media metadata', async () => {
        prisma.company.findUnique.mockResolvedValue(company);
        prisma.media.create.mockResolvedValue(media);

        await expect(
            service.create(user, {
                companyId: company.id,
                url: media.url,
                type: MediaType.IMAGE,
            }),
        ).resolves.toEqual(media);

        expect(prisma.media.create).toHaveBeenCalledWith({
            data: {
                companyId: company.id,
                url: media.url,
                type: MediaType.IMAGE,
                createdBy: user.sub,
            },
        });
    });

    it('rejects invalid media scope', async () => {
        await expect(
            service.create(user, {
                isGlobal: true,
                companyId: company.id,
                url: media.url,
                type: MediaType.IMAGE,
            }),
        ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('uploads file and creates media metadata', async () => {
        const uploaded = {
            url: '/uploads/media/file.jpg',
            type: MediaType.IMAGE,
        };

        prisma.company.findUnique.mockResolvedValue(company);
        storage.save.mockResolvedValue(uploaded);
        prisma.media.create.mockResolvedValue({
            ...media,
            url: uploaded.url,
        });

        await expect(
            service.upload(
                user,
                { buffer: Buffer.from('image'), mimetype: 'image/jpeg' },
                {
                    companyId: company.id,
                    title: 'Hero',
                },
            ),
        ).resolves.toEqual({ ...media, url: uploaded.url });

        expect(storage.save).toHaveBeenCalled();
        expect(prisma.media.create).toHaveBeenCalledWith({
            data: {
                companyId: company.id,
                url: uploaded.url,
                type: MediaType.IMAGE,
                entityType: undefined,
                entityId: undefined,
                isGlobal: false,
                altText: undefined,
                title: 'Hero',
                sortOrder: undefined,
                createdBy: user.sub,
            },
        });
    });

    it('finds global and company media for company site', async () => {
        prisma.company.findFirst.mockResolvedValue(company);
        prisma.media.findMany.mockResolvedValue([media]);
        prisma.media.count.mockResolvedValue(1);

        await expect(service.findForCompanySite(company.slug)).resolves.toEqual({
            data: [media],
            meta: { total: 1, page: 1, limit: 20, pages: 1 },
        });
    });

    it('soft deletes media', async () => {
        prisma.media.findUnique.mockResolvedValue(media);
        prisma.media.update.mockResolvedValue({ ...media, deletedAt: new Date() });

        await expect(service.remove(media.id, user)).resolves.toEqual({
            success: true,
        });
    });
});
