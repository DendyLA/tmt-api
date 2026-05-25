import { NotFoundException } from '@nestjs/common';
import { SiteService } from './site.service';

describe('SiteService', () => {
    let prisma: any;
    let service: SiteService;

    beforeEach(() => {
        prisma = {
            company: { findFirst: jest.fn() },
            post: { findMany: jest.fn() },
            media: { findMany: jest.fn() },
            adPlacement: { findMany: jest.fn() },
        };
        service = new SiteService(prisma);
    });

    it('returns aggregate home payload', async () => {
        const company = { id: 'company-1', slug: 'company' };
        prisma.company.findFirst.mockResolvedValue(company);
        prisma.post.findMany.mockResolvedValue([{ id: 'post-1' }]);
        prisma.media.findMany.mockResolvedValue([{ id: 'media-1' }]);
        prisma.adPlacement.findMany.mockResolvedValue([{ id: 'placement-1' }]);

        await expect(service.getHome('company')).resolves.toEqual({
            company: {
                ...company,
                projects: [],
                serviceCategories: [],
                services: [],
            },
            latestPosts: [{ id: 'post-1' }],
            media: [{ id: 'media-1' }],
            adPlacements: [{ id: 'placement-1' }],
        });
    });

    it('throws when company is missing', async () => {
        prisma.company.findFirst.mockResolvedValue(null);

        await expect(service.getHome('missing')).rejects.toBeInstanceOf(
            NotFoundException,
        );
    });
});
