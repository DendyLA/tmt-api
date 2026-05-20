import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateCompanyServiceDto } from './dto/create-company-service.dto';
import { CreateServiceCategoryDto } from './dto/create-service-category.dto';
import { UpdateCompanyServiceDto } from './dto/update-company-service.dto';
import { UpdateServiceCategoryDto } from './dto/update-service-category.dto';

@Injectable()
export class CompanyServicesService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly eventEmitter: EventEmitter2,
    ) {}

    async findCategoriesByCompanySlug(slug: string) {
        const company = await this.findActiveCompanyBySlug(slug);

        return this.prisma.serviceCategory.findMany({
            where: { companyId: company.id, deletedAt: null },
            orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        });
    }

    async findServicesByCompanySlug(slug: string) {
        const company = await this.findActiveCompanyBySlug(slug);

        return this.prisma.service.findMany({
            where: { companyId: company.id, deletedAt: null },
            include: { category: true },
            orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        });
    }

    async createCategory(companyId: string, user: any, dto: CreateServiceCategoryDto, req?: any) {
        await this.ensureActiveCompany(companyId);
        await this.ensureCategorySlugAvailable(companyId, dto.slug);

        const category = await this.prisma.serviceCategory.create({
            data: { ...dto, companyId },
        });

        this.eventEmitter.emit('company.serviceCategory.created', {
            user,
            category,
            req,
        });

        return category;
    }

    async updateCategory(id: string, user: any, dto: UpdateServiceCategoryDto, req?: any) {
        const category = await this.findActiveCategory(id);

        if (dto.slug && dto.slug !== category.slug) {
            await this.ensureCategorySlugAvailable(category.companyId, dto.slug, id);
        }

        const updated = await this.prisma.serviceCategory.update({
            where: { id },
            data: dto,
        });

        this.eventEmitter.emit('company.serviceCategory.updated', {
            user,
            before: category,
            after: updated,
            req,
        });

        return updated;
    }

    async removeCategory(id: string, user: any, req?: any) {
        const category = await this.findActiveCategory(id);

        const deleted = await this.prisma.serviceCategory.update({
            where: { id },
            data: { deletedAt: new Date() },
        });

        this.eventEmitter.emit('company.serviceCategory.deleted', {
            user,
            category: deleted,
            req,
        });

        return { success: true };
    }

    async createService(companyId: string, user: any, dto: CreateCompanyServiceDto, req?: any) {
        await this.ensureActiveCompany(companyId);
        await this.ensureCategoryBelongsToCompany(companyId, dto.categoryId);

        const service = await this.prisma.service.create({
            data: { ...dto, companyId },
        });

        this.eventEmitter.emit('company.service.created', {
            user,
            service,
            req,
        });

        return service;
    }

    async updateService(id: string, user: any, dto: UpdateCompanyServiceDto, req?: any) {
        const service = await this.findActiveService(id);
        await this.ensureCategoryBelongsToCompany(service.companyId, dto.categoryId);

        const updated = await this.prisma.service.update({
            where: { id },
            data: dto,
        });

        this.eventEmitter.emit('company.service.updated', {
            user,
            before: service,
            after: updated,
            req,
        });

        return updated;
    }

    async removeService(id: string, user: any, req?: any) {
        const service = await this.findActiveService(id);

        const deleted = await this.prisma.service.update({
            where: { id },
            data: { deletedAt: new Date() },
        });

        this.eventEmitter.emit('company.service.deleted', {
            user,
            service: deleted,
            req,
        });

        return { success: true };
    }

    private async ensureCategorySlugAvailable(companyId: string, slug: string, currentCategoryId?: string) {
        const category = await this.prisma.serviceCategory.findUnique({
            where: { companyId_slug: { companyId, slug } },
            select: { id: true },
        });

        if (category && category.id !== currentCategoryId) {
            throw new BadRequestException('Service category slug already in use');
        }
    }

    private async ensureCategoryBelongsToCompany(companyId: string, categoryId?: string | null) {
        if (!categoryId) return;

        const category = await this.prisma.serviceCategory.findFirst({
            where: { id: categoryId, companyId, deletedAt: null },
            select: { id: true },
        });

        if (!category) {
            throw new BadRequestException('Service category does not belong to company');
        }
    }

    private async findActiveCategory(id: string) {
        const category = await this.prisma.serviceCategory.findUnique({
            where: { id },
        });

        if (!category || category.deletedAt) {
            throw new NotFoundException('Service category not found');
        }

        return category;
    }

    private async findActiveService(id: string) {
        const service = await this.prisma.service.findUnique({ where: { id } });

        if (!service || service.deletedAt) {
            throw new NotFoundException('Service not found');
        }

        return service;
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
