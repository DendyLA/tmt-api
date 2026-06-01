import { NotFoundException } from '@nestjs/common';
import { VacancyStatus } from '@prisma/client';
import { VacancyModerationService } from './vacancy-moderation.service';

describe('VacancyModerationService', () => {
    let prisma: any;
    let audit: { log: jest.Mock };
    let service: VacancyModerationService;

    beforeEach(() => {
        prisma = {
            vacancy: {
                findUnique: jest.fn(),
                update: jest.fn(),
            },
        };
        audit = { log: jest.fn() };
        service = new VacancyModerationService(prisma, audit as any);
    });

    it('approves existing vacancy', async () => {
        const vacancy = { id: 'vacancy-1', status: VacancyStatus.APPROVED };
        prisma.vacancy.findUnique.mockResolvedValue({ id: vacancy.id });
        prisma.vacancy.update.mockResolvedValue(vacancy);

        await expect(
            service.approve(vacancy.id, { sub: 'admin-1' }),
        ).resolves.toEqual(vacancy);

        expect(prisma.vacancy.update).toHaveBeenCalledWith({
            where: { id: vacancy.id },
            data: { status: VacancyStatus.APPROVED },
        });
    });

    it('returns not found for missing vacancy', async () => {
        prisma.vacancy.findUnique.mockResolvedValue(null);

        await expect(
            service.approve('missing', { sub: 'admin-1' }),
        ).rejects.toBeInstanceOf(NotFoundException);
    });
});
