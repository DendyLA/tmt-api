import { VacancyStatus } from '@prisma/client';
import { VacanciesService } from './vacancies.service';

describe('VacanciesService', () => {
    let prisma: any;
    let service: VacanciesService;

    beforeEach(() => {
        prisma = {
            vacancy: {
                findMany: jest.fn(),
                count: jest.fn(),
            },
        };

        service = new VacanciesService(
            prisma,
            { emit: jest.fn() } as any,
            { hasAll: jest.fn().mockResolvedValue(false) } as any,
        );
    });

    it('filters public vacancies by approved status and optional tag', async () => {
        prisma.vacancy.findMany.mockResolvedValue([]);
        prisma.vacancy.count.mockResolvedValue(0);

        await expect(service.findAll(undefined, 'backend')).resolves.toEqual({
            data: [],
            meta: { total: 0, page: 1, limit: 20, pages: 0 },
        });
        expect(prisma.vacancy.findMany).toHaveBeenCalledWith({
            where: {
                AND: [{ deletedAt: null, status: VacancyStatus.APPROVED }],
                tags: {
                    some: {
                        tag: { slug: 'backend' },
                    },
                },
            },
            include: {
                tags: { include: { tag: true } },
            },
            skip: 0,
            take: 20,
            orderBy: { createdAt: 'desc' },
        });
    });
});
