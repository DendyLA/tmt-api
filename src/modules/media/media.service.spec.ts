import { BadRequestException } from '@nestjs/common';
import { MediaType } from '@prisma/client';
import { MediaService } from './media.service';

describe('MediaService', () => {
    let prisma: any;
    let eventEmitter: { emit: jest.Mock };
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
                findUnique: jest.fn(),
                update: jest.fn(),
            },
        };
        eventEmitter = { emit: jest.fn() };
        service = new MediaService(prisma, eventEmitter as any);
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

    it('finds global and company media for company site', async () => {
        prisma.company.findFirst.mockResolvedValue(company);
        prisma.media.findMany.mockResolvedValue([media]);

        await expect(service.findForCompanySite(company.slug)).resolves.toEqual([
            media,
        ]);
    });

    it('soft deletes media', async () => {
        prisma.media.findUnique.mockResolvedValue(media);
        prisma.media.update.mockResolvedValue({ ...media, deletedAt: new Date() });

        await expect(service.remove(media.id, user)).resolves.toEqual({
            success: true,
        });
    });
});
