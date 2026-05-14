import {
    Injectable,
    NotFoundException,
    ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateVacancyDto } from './dto/create-vacancy.dto';
import { UpdateVacancyDto } from './dto/update-vacancy.dto/update-vacancy.dto';
import { Prisma, VacancyStatus } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class VacanciesService {
    constructor(
        private prisma: PrismaService,
        private eventEmitter: EventEmitter2,
    ) {}

    private buildVacancyFilter(user?: any): Prisma.VacancyWhereInput {
        if (!user) {
            return { status: VacancyStatus.APPROVED };
        }

        if (['admin', 'superadmin'].includes(user.role)) {
            return {};
        }

        return {
            OR: [{ status: VacancyStatus.APPROVED }, { userId: user.sub }],
        };
    }

    async create(userId: string, dto: CreateVacancyDto, req?: any) {
        const vacancy = await this.prisma.vacancy.create({
            data: {
                ...dto,
                userId,
                status: VacancyStatus.PENDING,
            },
        });

        this.eventEmitter.emit('vacancy.created', {
            userId,
            vacancy,
            req,
        });

        return vacancy;
    }

    async findAll(user?: any) {
        return this.prisma.vacancy.findMany({
            where: this.buildVacancyFilter(user),
        });
    }

    async findOne(id: string, user?: any) {
        const isAdminOrSuper =
            user && ['admin', 'superadmin'].includes(user.role);

        const where: Prisma.VacancyWhereInput = { id };

        if (!isAdminOrSuper) {
            where.OR = user
                ? [{ status: VacancyStatus.APPROVED }, { userId: user.sub }]
                : [{ status: VacancyStatus.APPROVED }];
        }

        const vacancy = await this.prisma.vacancy.findFirst({ where });

        if (!vacancy) {
            throw new NotFoundException('Vacancy not found');
        }

        return vacancy;
    }

    async update(id: string, user: any, dto: UpdateVacancyDto, req?: any) {
        const vacancy = await this.prisma.vacancy.findUnique({
            where: { id },
        });

        if (!vacancy) {
            throw new NotFoundException('Vacancy not found');
        }

        if (
            !['admin', 'superadmin'].includes(user.role) &&
            vacancy.userId !== user.sub
        ) {
            throw new ForbiddenException('Not allowed');
        }

        const updated = await this.prisma.vacancy.update({
            where: { id },
            data: dto,
        });

        this.eventEmitter.emit('vacancy.updated', {
            user,
            before: vacancy,
            after: updated,
            req,
        });

        return updated;
    }

    async remove(id: string, user: any, req?: any) {
        const vacancy = await this.prisma.vacancy.findUnique({
            where: { id },
        });

        if (!vacancy) {
            throw new NotFoundException('Vacancy not found');
        }

        if (
            !['admin', 'superadmin'].includes(user.role) &&
            vacancy.userId !== user.sub
        ) {
            throw new ForbiddenException('Not allowed');
        }

        await this.prisma.vacancy.delete({
            where: { id },
        });

        this.eventEmitter.emit('vacancy.deleted', {
            user,
            vacancy,
            req,
        });

        return { success: true };
    }
}
