import {
    Injectable,
    NotFoundException,
    ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateVacancyDto } from './dto/create-vacancy.dto/create-vacancy.dto';
import { UpdateVacancyDto } from './dto/update-vacancy.dto/update-vacancy.dto';
import { Prisma, VacancyStatus } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PERMISSIONS } from '../auth/constants/permissions.constants';
import { PermissionResolverService } from '../auth/services/permission-resolver.service';

@Injectable()
export class VacanciesService {
    constructor(
        private prisma: PrismaService,
        private eventEmitter: EventEmitter2,
        private permissionResolver: PermissionResolverService,
    ) {}

    private async buildVacancyFilter(
        user?: any,
    ): Promise<Prisma.VacancyWhereInput> {
        const baseFilter = { deletedAt: null };

        if (!user) {
            return {
                ...baseFilter,
                status: VacancyStatus.APPROVED,
            };
        }

        if (await this.canManageVacancies(user)) {
            return baseFilter;
        }

        return {
            ...baseFilter,
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
            where: await this.buildVacancyFilter(user),
        });
    }

    async findOne(id: string, user?: any) {
        const canManageVacancies = user
            ? await this.canManageVacancies(user)
            : false;

        const where: Prisma.VacancyWhereInput = { id };

        if (!canManageVacancies) {
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

        if (!(await this.canAccessOwnedVacancy(user, vacancy.userId))) {
            throw new ForbiddenException('Not allowed');
        }

        // 🔥 считаем версию
        const lastVersion = await this.prisma.vacancyVersion.findFirst({
            where: { vacancyId: id },
            orderBy: { version: 'desc' },
        });

        const nextVersion = (lastVersion?.version || 0) + 1;

        // 🔥 сохраняем старую версию
        await this.prisma.vacancyVersion.create({
            data: {
                vacancyId: id,
                data: vacancy as any,
                version: nextVersion,
                createdBy: user.sub,
            },
        });

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

    async getVersions(id: string) {
        return this.prisma.vacancyVersion.findMany({
            where: { vacancyId: id },
            orderBy: { version: 'desc' },
        });
    }

    async rollback(id: string, versionId: string, user: any, req?: any) {
        const version = await this.prisma.vacancyVersion.findUnique({
            where: { id: versionId },
        });

        if (!version) {
            throw new NotFoundException('Version not found');
        }

        const updated = await this.prisma.vacancy.update({
            where: { id },
            data: version.data as any,
        });

        this.eventEmitter.emit('vacancy.rollback', {
            user,
            version,
            req,
        });

        return updated;
    }

    async restore(id: string, user: any, req?: any) {
        const vacancy = await this.prisma.vacancy.findUnique({
            where: { id },
        });

        if (!vacancy || !vacancy.deletedAt) {
            throw new NotFoundException('Vacancy not found or not deleted');
        }

        if (!(await this.canAccessOwnedVacancy(user, vacancy.userId))) {
            throw new ForbiddenException('Not allowed');
        }

        const restored = await this.prisma.vacancy.update({
            where: { id },
            data: {
                deletedAt: null,
            },
        });

        this.eventEmitter.emit('vacancy.restored', {
            user,
            vacancy: restored,
            req,
        });

        return restored;
    }

    async remove(id: string, user: any, req?: any) {
        const vacancy = await this.prisma.vacancy.findUnique({
            where: { id },
        });

        if (!vacancy) {
            throw new NotFoundException('Vacancy not found');
        }

        if (!(await this.canAccessOwnedVacancy(user, vacancy.userId))) {
            throw new ForbiddenException('Not allowed');
        }

        const updated = await this.prisma.vacancy.update({
            where: { id },
            data: {
                deletedAt: new Date(),
            },
        });

        this.eventEmitter.emit('vacancy.deleted', {
            user,
            vacancy: updated,
            req,
        });

        return { success: true };
    }

    private async canAccessOwnedVacancy(
        user: any,
        vacancyOwnerId: string,
    ): Promise<boolean> {
        return (
            vacancyOwnerId === user.sub || (await this.canManageVacancies(user))
        );
    }

    private async canManageVacancies(user: any): Promise<boolean> {
        return this.permissionResolver.hasAll(user, [
            PERMISSIONS.VACANCY.MANAGE,
        ]);
    }
}
