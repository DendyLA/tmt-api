import { VacanciesController } from './vacancies.controller';

describe('VacanciesController', () => {
    let service: any;
    let controller: VacanciesController;

    beforeEach(() => {
        service = {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            getVersions: jest.fn(),
            rollback: jest.fn(),
            restore: jest.fn(),
        };
        controller = new VacanciesController(service);
    });

    it('passes optional tag filter to service', async () => {
        service.findAll.mockResolvedValue([]);

        await expect(
            controller.findAll({ user: undefined }, 'backend'),
        ).resolves.toEqual([]);
        expect(service.findAll).toHaveBeenCalledWith(
            undefined,
            'backend',
            undefined,
        );
    });
});
