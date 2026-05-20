import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../database/prisma/prisma.service';
import { UpsertCompanyContactDto } from './dto/upsert-company-contact.dto';

@Injectable()
export class CompanyContactsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly eventEmitter: EventEmitter2,
    ) {}

    async findByCompanySlug(slug: string) {
        const company = await this.findActiveCompanyBySlug(slug);

        return this.prisma.companyContact.findUnique({
            where: { companyId: company.id },
        });
    }

    async upsert(companyId: string, user: any, dto: UpsertCompanyContactDto, req?: any) {
        await this.ensureActiveCompany(companyId);

        const contact = await this.prisma.companyContact.upsert({
            where: { companyId },
            update: dto,
            create: {
                ...dto,
                companyId,
            },
        });

        this.eventEmitter.emit('company.contact.upserted', {
            user,
            contact,
            req,
        });

        return contact;
    }

    private async ensureActiveCompany(id: string) {
        const company = await this.prisma.company.findUnique({
            where: { id },
            select: { id: true, deletedAt: true },
        });

        if (!company || company.deletedAt) {
            throw new NotFoundException('Company not found');
        }
    }

    private async findActiveCompanyBySlug(slug: string) {
        const company = await this.prisma.company.findFirst({
            where: { slug, deletedAt: null },
            select: { id: true },
        });

        if (!company) {
            throw new NotFoundException('Company not found');
        }

        return company;
    }
}
