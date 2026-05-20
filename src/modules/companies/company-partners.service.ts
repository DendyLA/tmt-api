import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';

@Injectable()
export class CompanyPartnersService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly eventEmitter: EventEmitter2,
    ) {}

    async findByCompanySlug(slug: string) {
        const company = await this.findActiveCompanyBySlug(slug);

        return this.prisma.partner.findMany({
            where: {
                companyId: company.id,
                isActive: true,
                deletedAt: null,
            },
            orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        });
    }

    async create(companyId: string, user: any, dto: CreatePartnerDto, req?: any) {
        await this.ensureActiveCompany(companyId);

        const partner = await this.prisma.partner.create({
            data: { ...dto, companyId },
        });

        this.eventEmitter.emit('company.partner.created', {
            user,
            partner,
            req,
        });

        return partner;
    }

    async update(id: string, user: any, dto: UpdatePartnerDto, req?: any) {
        const partner = await this.findActivePartner(id);

        const updated = await this.prisma.partner.update({
            where: { id },
            data: dto,
        });

        this.eventEmitter.emit('company.partner.updated', {
            user,
            before: partner,
            after: updated,
            req,
        });

        return updated;
    }

    async remove(id: string, user: any, req?: any) {
        const partner = await this.findActivePartner(id);

        const deleted = await this.prisma.partner.update({
            where: { id },
            data: { deletedAt: new Date() },
        });

        this.eventEmitter.emit('company.partner.deleted', {
            user,
            partner: deleted,
            req,
        });

        return { success: true };
    }

    private async findActivePartner(id: string) {
        const partner = await this.prisma.partner.findUnique({ where: { id } });

        if (!partner || partner.deletedAt) {
            throw new NotFoundException('Partner not found');
        }

        return partner;
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
