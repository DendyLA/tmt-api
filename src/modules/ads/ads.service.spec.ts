import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AdType } from '@prisma/client';
import { AdsService } from './ads.service';

describe('AdsService', () => {
    let prisma: any;
    let service: AdsService;

    const company = { id: 'company-1', slug: 'company', deletedAt: null };

    beforeEach(() => {
        prisma = {
            company: { findFirst: jest.fn(), findUnique: jest.fn() },
            adPlacement: {
                findMany: jest.fn(),
                create: jest.fn(),
                update: jest.fn(),
                findUnique: jest.fn(),
            },
            adSpace: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
            ad: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
        };
        service = new AdsService(prisma);
    });

    it('finds active ads for company site', async () => {
        prisma.company.findFirst.mockResolvedValue(company);
        prisma.adPlacement.findMany.mockResolvedValue([{ id: 'placement-1' }]);

        await expect(service.findForCompanySite(company.slug)).resolves.toEqual([
            { id: 'placement-1' },
        ]);
    });

    it('creates company ad', async () => {
        const ad = { id: 'ad-1', companyId: company.id };
        prisma.company.findUnique.mockResolvedValue(company);
        prisma.ad.create.mockResolvedValue(ad);

        await expect(
            service.createAd({
                companyId: company.id,
                title: 'Ad',
                type: AdType.IMAGE,
            }),
        ).resolves.toEqual(ad);
    });

    it('rejects invalid global ad scope', async () => {
        await expect(
            service.createAd({
                isGlobal: true,
                companyId: company.id,
                title: 'Ad',
                type: AdType.IMAGE,
            }),
        ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('returns not found for missing ad placement tracking', async () => {
        prisma.adPlacement.findUnique.mockResolvedValue(null);

        await expect(service.trackImpression('missing')).rejects.toBeInstanceOf(
            NotFoundException,
        );
        await expect(service.trackClick('missing')).rejects.toBeInstanceOf(
            NotFoundException,
        );
    });
});
