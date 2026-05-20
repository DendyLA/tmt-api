import { CompaniesController } from './companies.controller';

describe('CompaniesController', () => {
    let companiesService: {
        create: jest.Mock;
        findAll: jest.Mock;
        findOneBySlug: jest.Mock;
        update: jest.Mock;
        remove: jest.Mock;
    };
    let controller: CompaniesController;

    const req = {
        user: {
            sub: 'user-1',
            email: 'admin@example.com',
        },
    };

    const company = {
        id: 'company-1',
        name: 'TMT Group',
        slug: 'tmt-group',
    };

    beforeEach(() => {
        companiesService = {
            create: jest.fn(),
            findAll: jest.fn(),
            findOneBySlug: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
        };

        controller = new CompaniesController(companiesService as any);
    });

    it('creates company', async () => {
        companiesService.create.mockResolvedValue(company);

        await expect(
            controller.create(req, {
                name: company.name,
                slug: company.slug,
            }),
        ).resolves.toEqual(company);

        expect(companiesService.create).toHaveBeenCalledWith(
            req.user,
            {
                name: company.name,
                slug: company.slug,
            },
            req,
        );
    });

    it('lists companies', async () => {
        companiesService.findAll.mockResolvedValue([company]);

        await expect(controller.findAll()).resolves.toEqual([company]);

        expect(companiesService.findAll).toHaveBeenCalledWith();
    });

    it('finds company by slug', async () => {
        companiesService.findOneBySlug.mockResolvedValue(company);

        await expect(controller.findOneBySlug(company.slug)).resolves.toEqual(
            company,
        );

        expect(companiesService.findOneBySlug).toHaveBeenCalledWith(
            company.slug,
        );
    });

    it('updates company', async () => {
        const dto = { name: 'Updated TMT' };
        const updated = { ...company, ...dto };
        companiesService.update.mockResolvedValue(updated);

        await expect(controller.update(company.id, req, dto)).resolves.toEqual(
            updated,
        );

        expect(companiesService.update).toHaveBeenCalledWith(
            company.id,
            req.user,
            dto,
            req,
        );
    });

    it('removes company', async () => {
        companiesService.remove.mockResolvedValue({ success: true });

        await expect(controller.remove(company.id, req)).resolves.toEqual({
            success: true,
        });

        expect(companiesService.remove).toHaveBeenCalledWith(
            company.id,
            req.user,
            req,
        );
    });
});
