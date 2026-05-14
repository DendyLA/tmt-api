import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AuditLogService } from '../audit-log.service';

@Injectable()
export class AuditListener {
    constructor(private audit: AuditLogService) {}

    @OnEvent('vacancy.created')
    async handleCreated(payload: any) {
        await this.audit.log({
            userId: payload.userId,
            action: 'VACANCY_CREATED',
            entityType: 'vacancy',
            entityId: payload.vacancy.id,
            ipAddress: payload.req?.ip,
            userAgent: payload.req?.headers?.['user-agent'],
        });
    }

    @OnEvent('vacancy.updated')
    async handleUpdated(payload: any) {
        await this.audit.log({
            userId: payload.user.sub,
            action: 'VACANCY_UPDATED',
            entityType: 'vacancy',
            entityId: payload.after.id,
            metadata: {
                before: payload.before,
                after: payload.after,
            },
            ipAddress: payload.req?.ip,
            userAgent: payload.req?.headers?.['user-agent'],
        });
    }

    @OnEvent('vacancy.deleted')
    async handleDeleted(payload: any) {
        await this.audit.log({
            userId: payload.user.sub,
            action: 'VACANCY_DELETED',
            entityType: 'vacancy',
            entityId: payload.vacancy.id,
            metadata: { deleted: payload.vacancy },
            ipAddress: payload.req?.ip,
            userAgent: payload.req?.headers?.['user-agent'],
        });
    }
}
