import { NotFoundException } from '@nestjs/common';
import { ContentVersionsService } from './content-versions.service';

describe('ContentVersionsService', () => {
    let prisma: any;
    let service: ContentVersionsService;

    beforeEach(() => {
        prisma = {
            contentVersion: {
                findFirst: jest.fn(),
                create: jest.fn(),
                findMany: jest.fn(),
                findUnique: jest.fn(),
            },
        };
        service = new ContentVersionsService(prisma);
    });

    it('creates next content version', async () => {
        prisma.contentVersion.findFirst.mockResolvedValue({ version: 2 });
        prisma.contentVersion.create.mockResolvedValue({ id: 'v3', version: 3 });

        await expect(
            service.createVersion('post', 'post-1', { title: 'Old' }, 'user-1'),
        ).resolves.toEqual({ id: 'v3', version: 3 });

        expect(prisma.contentVersion.create).toHaveBeenCalledWith({
            data: {
                entityType: 'post',
                entityId: 'post-1',
                data: { title: 'Old' },
                version: 3,
                createdBy: 'user-1',
            },
        });
    });

    it('throws when version is missing', async () => {
        prisma.contentVersion.findUnique.mockResolvedValue(null);

        await expect(service.findOne('missing')).rejects.toBeInstanceOf(
            NotFoundException,
        );
    });
});
