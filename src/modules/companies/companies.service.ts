import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompaniesService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly eventEmitter: EventEmitter2,
    ) {}

    async create(user: any, dto: CreateCompanyDto, req?: any) {
        await this.ensureSlugAvailable(dto.slug);

        const company = await this.prisma.$transaction(async (tx) => {
            const created = await tx.company.create({
                data: dto,
            });

            await tx.companyMember.create({
                data: {
                    companyId: created.id,
                    userId: user.sub,
                    isOwner: true,
                },
            });

            return created;
        });

        this.eventEmitter.emit('company.created', {
            user,
            company,
            req,
        });

        return company;
    }

    async findAll() {
        return this.prisma.company.findMany({
            where: { deletedAt: null },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOneBySlug(slug: string) {
        const company = await this.prisma.company.findFirst({
            where: {
                slug,
                deletedAt: null,
            },
        });

        if (!company) {
            throw new NotFoundException('Company not found');
        }

        return company;
    }

    async update(id: string, user: any, dto: UpdateCompanyDto, req?: any) {
        const company = await this.prisma.company.findUnique({
            where: { id },
        });

        if (!company || company.deletedAt) {
            throw new NotFoundException('Company not found');
        }

        if (dto.slug && dto.slug !== company.slug) {
            await this.ensureSlugAvailable(dto.slug, id);
        }

        const updated = await this.prisma.company.update({
            where: { id },
            data: dto,
        });

        this.eventEmitter.emit('company.updated', {
            user,
            before: company,
            after: updated,
            req,
        });

        return updated;
    }

    async remove(id: string, user: any, req?: any) {
        const company = await this.prisma.company.findUnique({
            where: { id },
        });

        if (!company || company.deletedAt) {
            throw new NotFoundException('Company not found');
        }

        const deleted = await this.prisma.company.update({
            where: { id },
            data: {
                deletedAt: new Date(),
            },
        });

        this.eventEmitter.emit('company.deleted', {
            user,
            company: deleted,
            req,
        });

        return { success: true };
    }

    private async ensureSlugAvailable(slug: string, currentCompanyId?: string) {
        const company = await this.prisma.company.findUnique({
            where: { slug },
            select: { id: true },
        });

        if (company && company.id !== currentCompanyId) {
            throw new BadRequestException('Company slug already in use');
        }
    }
}
