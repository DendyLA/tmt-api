import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { VacancyStatus } from '@prisma/client';
import { AuditLogService } from '../../audit-log/audit-log.service';

@Injectable()
export class VacancyModerationService {
    constructor(
        private prisma: PrismaService,
        private audit: AuditLogService,
    ) {}

    async approve(id: string, user: any, req?: any) {
        await this.ensureVacancyExists(id);

        const updated = await this.prisma.vacancy.update({
            where: { id },
            data: { status: VacancyStatus.APPROVED },
        });

        await this.audit.log({
            userId: user.sub,
            action: 'VACANCY_APPROVED',
            entityType: 'vacancy',
            entityId: id,
            ipAddress: req?.ip,
            userAgent: req?.headers?.['user-agent'],
        });

        return updated;
    }

    async reject(id: string, user: any, req?: any) {
        await this.ensureVacancyExists(id);

        const updated = await this.prisma.vacancy.update({
            where: { id },
            data: { status: VacancyStatus.REJECTED },
        });

        await this.audit.log({
            userId: user.sub,
            action: 'VACANCY_REJECTED',
            entityType: 'vacancy',
            entityId: id,
            metadata: { reason: 'manual reject' },
            ipAddress: req?.ip,
            userAgent: req?.headers?.['user-agent'],
        });

        return updated;
    }

    async archive(id: string, user: any, req?: any) {
        await this.ensureVacancyExists(id);

        const updated = await this.prisma.vacancy.update({
            where: { id },
            data: {
                status: VacancyStatus.ARCHIVED,
            },
        });

        await this.audit.log({
            userId: user.sub,
            action: 'VACANCY_ARCHIVED',
            entityType: 'vacancy',
            entityId: id,
            ipAddress: req?.ip,
            userAgent: req?.headers?.['user-agent'],
        });

        return updated;
    }

    private async ensureVacancyExists(id: string) {
        const vacancy = await this.prisma.vacancy.findUnique({
            where: { id },
            select: { id: true },
        });

        if (!vacancy) throw new NotFoundException('Vacancy not found');
    }
}
