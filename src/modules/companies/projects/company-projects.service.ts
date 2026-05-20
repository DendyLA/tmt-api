import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ProjectStatus } from '@prisma/client';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class CompanyProjectsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly eventEmitter: EventEmitter2,
    ) {}

    async findPublishedByCompanySlug(slug: string) {
        const company = await this.findActiveCompanyBySlug(slug);

        return this.prisma.project.findMany({
            where: {
                companyId: company.id,
                status: ProjectStatus.PUBLISHED,
                deletedAt: null,
            },
            orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        });
    }

    async create(
        companyId: string,
        user: any,
        dto: CreateProjectDto,
        req?: any,
    ) {
        await this.ensureActiveCompany(companyId);

        const project = await this.prisma.project.create({
            data: {
                ...dto,
                companyId,
            },
        });

        this.eventEmitter.emit('company.project.created', {
            user,
            project,
            req,
        });

        return project;
    }

    async update(id: string, user: any, dto: UpdateProjectDto, req?: any) {
        const project = await this.findActiveProject(id);

        const updated = await this.prisma.project.update({
            where: { id },
            data: dto,
        });

        this.eventEmitter.emit('company.project.updated', {
            user,
            before: project,
            after: updated,
            req,
        });

        return updated;
    }

    async remove(id: string, user: any, req?: any) {
        const project = await this.findActiveProject(id);

        const deleted = await this.prisma.project.update({
            where: { id },
            data: { deletedAt: new Date() },
        });

        this.eventEmitter.emit('company.project.deleted', {
            user,
            project: deleted,
            req,
        });

        return { success: true };
    }

    private async findActiveProject(id: string) {
        const project = await this.prisma.project.findUnique({
            where: { id },
        });

        if (!project || project.deletedAt) {
            throw new NotFoundException('Project not found');
        }

        return project;
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
