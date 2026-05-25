import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CompaniesService } from './companies.service';

describe('CompaniesService', () => {
    let prisma: {
        company: {
            create: jest.Mock;
            findMany: jest.Mock;
            findFirst: jest.Mock;
            findUnique: jest.Mock;
            update: jest.Mock;
        };
        companyMember: {
            create: jest.Mock;
        };
        $transaction: jest.Mock;
    };
    let eventEmitter: {
        emit: jest.Mock;
    };
    let service: CompaniesService;

    const user = {
        sub: 'user-1',
        email: 'admin@example.com',
        permissions: [],
    };

    const company = {
        id: 'company-1',
        name: 'TMT Group',
        slug: 'tmt-group',
        description: null,
        logo: null,
        website: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
    };

    beforeEach(() => {
        prisma = {
            company: {
                create: jest.fn(),
                findMany: jest.fn(),
                findFirst: jest.fn(),
                findUnique: jest.fn(),
                update: jest.fn(),
            },
            companyMember: {
                create: jest.fn(),
            },
            $transaction: jest.fn((callback) => callback(prisma)),
        };

        eventEmitter = {
            emit: jest.fn(),
        };

        service = new CompaniesService(prisma as any, eventEmitter as any);
    });

    it('creates company and owner membership in a transaction', async () => {
        prisma.company.findUnique.mockResolvedValue(null);
        prisma.company.create.mockResolvedValue(company);
        prisma.companyMember.create.mockResolvedValue({
            id: 'member-1',
            companyId: company.id,
            userId: user.sub,
            isOwner: true,
        });

        await expect(
            service.create(
                user,
                {
                    name: company.name,
                    slug: company.slug,
                },
                { ip: '127.0.0.1' },
            ),
        ).resolves.toEqual(company);

        expect(prisma.$transaction).toHaveBeenCalledTimes(1);
        expect(prisma.company.create).toHaveBeenCalledWith({
            data: {
                name: company.name,
                slug: company.slug,
            },
        });
        expect(prisma.companyMember.create).toHaveBeenCalledWith({
            data: {
                companyId: company.id,
                userId: user.sub,
                isOwner: true,
            },
        });
        expect(eventEmitter.emit).toHaveBeenCalledWith('company.created', {
            user,
            company,
            req: { ip: '127.0.0.1' },
        });
    });

    it('throws when creating company with duplicate slug', async () => {
        prisma.company.findUnique.mockResolvedValue({ id: company.id });

        await expect(
            service.create(user, {
                name: company.name,
                slug: company.slug,
            }),
        ).rejects.toBeInstanceOf(BadRequestException);

        expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('finds public non-deleted companies', async () => {
        prisma.company.findMany.mockResolvedValue([company]);

        await expect(service.findAll()).resolves.toEqual([company]);

        expect(prisma.company.findMany).toHaveBeenCalledWith({
            where: { deletedAt: null },
            include: { translations: true },
            orderBy: { createdAt: 'desc' },
        });
    });

    it('finds public company by slug', async () => {
        prisma.company.findFirst.mockResolvedValue(company);

        await expect(service.findOneBySlug(company.slug)).resolves.toEqual(
            company,
        );

        expect(prisma.company.findFirst).toHaveBeenCalledWith({
            where: {
                slug: company.slug,
                deletedAt: null,
            },
            include: { translations: true },
        });
    });

    it('throws when public company by slug is missing', async () => {
        prisma.company.findFirst.mockResolvedValue(null);

        await expect(service.findOneBySlug('missing')).rejects.toBeInstanceOf(
            NotFoundException,
        );
    });

    it('updates company and emits audit event', async () => {
        const updated = {
            ...company,
            name: 'Updated TMT',
        };

        prisma.company.findUnique
            .mockResolvedValueOnce(company)
            .mockResolvedValueOnce(null);
        prisma.company.update.mockResolvedValue(updated);

        await expect(
            service.update(
                company.id,
                user,
                {
                    name: updated.name,
                    slug: 'updated-tmt',
                },
                { ip: '127.0.0.1' },
            ),
        ).resolves.toEqual(updated);

        expect(prisma.company.update).toHaveBeenCalledWith({
            where: { id: company.id },
            data: {
                name: updated.name,
                slug: 'updated-tmt',
            },
        });
        expect(eventEmitter.emit).toHaveBeenCalledWith('company.updated', {
            user,
            before: company,
            after: updated,
            req: { ip: '127.0.0.1' },
        });
    });

    it('throws when updating a deleted or missing company', async () => {
        prisma.company.findUnique.mockResolvedValue(null);

        await expect(
            service.update(company.id, user, {
                name: 'Updated TMT',
            }),
        ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws when updating company to duplicate slug', async () => {
        prisma.company.findUnique
            .mockResolvedValueOnce(company)
            .mockResolvedValueOnce({ id: 'another-company' });

        await expect(
            service.update(company.id, user, {
                slug: 'another-company',
            }),
        ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('soft deletes company and emits audit event', async () => {
        const deleted = {
            ...company,
            deletedAt: new Date(),
        };

        prisma.company.findUnique.mockResolvedValue(company);
        prisma.company.update.mockResolvedValue(deleted);

        await expect(
            service.remove(company.id, user, { ip: '127.0.0.1' }),
        ).resolves.toEqual({ success: true });

        expect(prisma.company.update).toHaveBeenCalledWith({
            where: { id: company.id },
            data: {
                deletedAt: expect.any(Date),
            },
        });
        expect(eventEmitter.emit).toHaveBeenCalledWith('company.deleted', {
            user,
            company: deleted,
            req: { ip: '127.0.0.1' },
        });
    });
});
