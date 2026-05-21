import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { UpsertCompanySiteSettingsDto } from './dto/upsert-company-site-settings.dto';

@Injectable()
export class CompanySiteSettingsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly eventEmitter: EventEmitter2,
    ) {}

    async findByCompany(companyId: string) {
        await this.ensureActiveCompany(companyId);

        return this.prisma.companySiteSettings.findUnique({
            where: { companyId },
        });
    }

    async upsert(
        companyId: string,
        user: any,
        dto: UpsertCompanySiteSettingsDto,
        req?: any,
    ) {
        await this.ensureActiveCompany(companyId);

        const normalizedDomain = this.normalizeDomain(dto.domain);
        if (normalizedDomain) {
            await this.ensureDomainAvailable(normalizedDomain, companyId);
        }

        const settings = await this.prisma.companySiteSettings.upsert({
            where: { companyId },
            update: {
                domain: normalizedDomain,
                isActive: dto.isActive,
                sortOrder: dto.sortOrder,
            },
            create: {
                companyId,
                domain: normalizedDomain,
                isActive: dto.isActive ?? true,
                sortOrder: dto.sortOrder ?? 0,
            },
        });

        this.eventEmitter.emit('company.siteSettings.updated', {
            user,
            settings,
            req,
        });

        return settings;
    }

    private normalizeDomain(domain?: string | null) {
        if (domain === null) return null;
        if (!domain) return undefined;

        return domain
            .trim()
            .toLowerCase()
            .replace(/^https?:\/\//, '')
            .replace(/\/$/, '');
    }

    private async ensureDomainAvailable(domain: string, companyId: string) {
        const existing = await this.prisma.companySiteSettings.findUnique({
            where: { domain },
            select: { companyId: true },
        });

        if (existing && existing.companyId !== companyId) {
            throw new BadRequestException('Domain already in use');
        }
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
}
