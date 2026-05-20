import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateCompanySocialLinkDto } from './dto/create-company-social-link.dto';
import { UpdateCompanySocialLinkDto } from './dto/update-company-social-link.dto';

@Injectable()
export class CompanySocialLinksService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly eventEmitter: EventEmitter2,
    ) {}

    async findByCompanySlug(slug: string) {
        const company = await this.findActiveCompanyBySlug(slug);

        return this.prisma.companySocialLink.findMany({
            where: { companyId: company.id, deletedAt: null },
            orderBy: { createdAt: 'desc' },
        });
    }

    async create(companyId: string, user: any, dto: CreateCompanySocialLinkDto, req?: any) {
        await this.ensureActiveCompany(companyId);

        const socialLink = await this.prisma.companySocialLink.create({
            data: {
                ...dto,
                companyId,
            },
        });

        this.eventEmitter.emit('company.socialLink.created', {
            user,
            socialLink,
            req,
        });

        return socialLink;
    }

    async update(id: string, user: any, dto: UpdateCompanySocialLinkDto, req?: any) {
        const socialLink = await this.findActiveSocialLink(id);

        const updated = await this.prisma.companySocialLink.update({
            where: { id },
            data: dto,
        });

        this.eventEmitter.emit('company.socialLink.updated', {
            user,
            before: socialLink,
            after: updated,
            req,
        });

        return updated;
    }

    async remove(id: string, user: any, req?: any) {
        const socialLink = await this.findActiveSocialLink(id);

        const deleted = await this.prisma.companySocialLink.update({
            where: { id },
            data: { deletedAt: new Date() },
        });

        this.eventEmitter.emit('company.socialLink.deleted', {
            user,
            socialLink: deleted,
            req,
        });

        return { success: true };
    }

    private async findActiveSocialLink(id: string) {
        const socialLink = await this.prisma.companySocialLink.findUnique({
            where: { id },
        });

        if (!socialLink || socialLink.deletedAt) {
            throw new NotFoundException('Social link not found');
        }

        return socialLink;
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
