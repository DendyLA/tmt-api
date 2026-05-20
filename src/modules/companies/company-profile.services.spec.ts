import { NotFoundException } from '@nestjs/common';
import { ProjectStatus } from '@prisma/client';
import { CompanyContactsService } from './contacts/company-contacts.service';
import { CompanyProjectsService } from './projects/company-projects.service';
import { CompanySocialLinksService } from './social-links/company-social-links.service';

describe('Company profile services', () => {
    let prisma: any;
    let eventEmitter: { emit: jest.Mock };

    const user = { sub: 'user-1' };
    const company = { id: 'company-1', slug: 'company', deletedAt: null };

    beforeEach(() => {
        prisma = {
            company: {
                findFirst: jest.fn(),
                findUnique: jest.fn(),
            },
            companyContact: {
                findUnique: jest.fn(),
                upsert: jest.fn(),
            },
            companySocialLink: {
                findMany: jest.fn(),
                create: jest.fn(),
                findUnique: jest.fn(),
                update: jest.fn(),
            },
            project: {
                findMany: jest.fn(),
                create: jest.fn(),
                findUnique: jest.fn(),
                update: jest.fn(),
            },
        };

        eventEmitter = { emit: jest.fn() };
    });

    it('reads and upserts company contact', async () => {
        const service = new CompanyContactsService(prisma, eventEmitter as any);
        const contact = {
            id: 'contact-1',
            companyId: company.id,
            email: 'info@company.tm',
        };

        prisma.company.findFirst.mockResolvedValue(company);
        prisma.company.findUnique.mockResolvedValue(company);
        prisma.companyContact.findUnique.mockResolvedValue(contact);
        prisma.companyContact.upsert.mockResolvedValue(contact);

        await expect(service.findByCompanySlug(company.slug)).resolves.toEqual(
            contact,
        );
        await expect(
            service.upsert(company.id, user, { email: contact.email }),
        ).resolves.toEqual(contact);

        expect(prisma.companyContact.upsert).toHaveBeenCalledWith({
            where: { companyId: company.id },
            update: { email: contact.email },
            create: { companyId: company.id, email: contact.email },
        });
        expect(eventEmitter.emit).toHaveBeenCalledWith(
            'company.contact.upserted',
            {
                user,
                contact,
                req: undefined,
            },
        );
    });

    it('manages company social links', async () => {
        const service = new CompanySocialLinksService(
            prisma,
            eventEmitter as any,
        );
        const socialLink = {
            id: 'social-1',
            companyId: company.id,
            platform: 'instagram',
            url: 'https://instagram.com/company',
            deletedAt: null,
        };

        prisma.company.findFirst.mockResolvedValue(company);
        prisma.company.findUnique.mockResolvedValue(company);
        prisma.companySocialLink.findMany.mockResolvedValue([socialLink]);
        prisma.companySocialLink.create.mockResolvedValue(socialLink);
        prisma.companySocialLink.findUnique.mockResolvedValue(socialLink);
        prisma.companySocialLink.update.mockResolvedValue({
            ...socialLink,
            username: 'company',
        });

        await expect(service.findByCompanySlug(company.slug)).resolves.toEqual([
            socialLink,
        ]);
        await expect(
            service.create(company.id, user, {
                platform: socialLink.platform,
                url: socialLink.url,
            }),
        ).resolves.toEqual(socialLink);
        await expect(
            service.update(socialLink.id, user, { username: 'company' }),
        ).resolves.toEqual({ ...socialLink, username: 'company' });
        await expect(service.remove(socialLink.id, user)).resolves.toEqual({
            success: true,
        });
    });

    it('manages company projects and publishes only public projects', async () => {
        const service = new CompanyProjectsService(prisma, eventEmitter as any);
        const project = {
            id: 'project-1',
            companyId: company.id,
            title: 'Project',
            description: 'Project description',
            status: ProjectStatus.PUBLISHED,
            deletedAt: null,
        };

        prisma.company.findFirst.mockResolvedValue(company);
        prisma.company.findUnique.mockResolvedValue(company);
        prisma.project.findMany.mockResolvedValue([project]);
        prisma.project.create.mockResolvedValue(project);
        prisma.project.findUnique.mockResolvedValue(project);
        prisma.project.update.mockResolvedValue({
            ...project,
            title: 'Updated project',
        });

        await expect(
            service.findPublishedByCompanySlug(company.slug),
        ).resolves.toEqual([project]);
        expect(prisma.project.findMany).toHaveBeenCalledWith({
            where: {
                companyId: company.id,
                status: ProjectStatus.PUBLISHED,
                deletedAt: null,
            },
            orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        });

        await expect(
            service.create(company.id, user, {
                title: project.title,
                description: project.description,
                status: ProjectStatus.PUBLISHED,
            }),
        ).resolves.toEqual(project);
        await expect(
            service.update(project.id, user, { title: 'Updated project' }),
        ).resolves.toEqual({ ...project, title: 'Updated project' });
        await expect(service.remove(project.id, user)).resolves.toEqual({
            success: true,
        });
    });

    it('throws when company is missing for public profile reads', async () => {
        const contactService = new CompanyContactsService(
            prisma,
            eventEmitter as any,
        );

        prisma.company.findFirst.mockResolvedValue(null);

        await expect(
            contactService.findByCompanySlug('missing'),
        ).rejects.toBeInstanceOf(NotFoundException);
    });
});
