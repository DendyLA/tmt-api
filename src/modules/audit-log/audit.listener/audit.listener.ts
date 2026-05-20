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

    @OnEvent('vacancy.restored')
    async handleRestored(payload: any) {
        await this.audit.log({
            userId: payload.user.sub,
            action: 'VACANCY_RESTORED',
            entityType: 'vacancy',
            entityId: payload.vacancy.id,
            ipAddress: payload.req?.ip,
            userAgent: payload.req?.headers?.['user-agent'],
        });
    }

    @OnEvent('vacancy.rollback')
    async handleRollback(payload: any) {
        await this.audit.log({
            userId: payload.user.sub,
            action: 'VACANCY_ROLLBACK',
            entityType: 'vacancy',
            entityId: payload.version.vacancyId,
            metadata: {
                versionId: payload.version.id,
            },
            ipAddress: payload.req?.ip,
            userAgent: payload.req?.headers?.['user-agent'],
        });
    }

    @OnEvent('company.created')
    async handleCompanyCreated(payload: any) {
        await this.audit.log({
            userId: payload.user.sub,
            action: 'COMPANY_CREATED',
            entityType: 'company',
            entityId: payload.company.id,
            ipAddress: payload.req?.ip,
            userAgent: payload.req?.headers?.['user-agent'],
        });
    }

    @OnEvent('company.updated')
    async handleCompanyUpdated(payload: any) {
        await this.audit.log({
            userId: payload.user.sub,
            action: 'COMPANY_UPDATED',
            entityType: 'company',
            entityId: payload.after.id,
            metadata: {
                before: payload.before,
                after: payload.after,
            },
            ipAddress: payload.req?.ip,
            userAgent: payload.req?.headers?.['user-agent'],
        });
    }

    @OnEvent('company.deleted')
    async handleCompanyDeleted(payload: any) {
        await this.audit.log({
            userId: payload.user.sub,
            action: 'COMPANY_DELETED',
            entityType: 'company',
            entityId: payload.company.id,
            metadata: { deleted: payload.company },
            ipAddress: payload.req?.ip,
            userAgent: payload.req?.headers?.['user-agent'],
        });
    }

    @OnEvent('company.contact.upserted')
    async handleCompanyContactUpserted(payload: any) {
        await this.audit.log({
            userId: payload.user.sub,
            companyId: payload.contact.companyId,
            action: 'COMPANY_CONTACT_UPSERTED',
            entityType: 'company_contact',
            entityId: payload.contact.id,
            metadata: { contact: payload.contact },
            ipAddress: payload.req?.ip,
            userAgent: payload.req?.headers?.['user-agent'],
        });
    }

    @OnEvent('company.socialLink.created')
    async handleCompanySocialLinkCreated(payload: any) {
        await this.audit.log({
            userId: payload.user.sub,
            companyId: payload.socialLink.companyId,
            action: 'COMPANY_SOCIAL_LINK_CREATED',
            entityType: 'company_social_link',
            entityId: payload.socialLink.id,
            ipAddress: payload.req?.ip,
            userAgent: payload.req?.headers?.['user-agent'],
        });
    }

    @OnEvent('company.socialLink.updated')
    async handleCompanySocialLinkUpdated(payload: any) {
        await this.audit.log({
            userId: payload.user.sub,
            companyId: payload.after.companyId,
            action: 'COMPANY_SOCIAL_LINK_UPDATED',
            entityType: 'company_social_link',
            entityId: payload.after.id,
            metadata: {
                before: payload.before,
                after: payload.after,
            },
            ipAddress: payload.req?.ip,
            userAgent: payload.req?.headers?.['user-agent'],
        });
    }

    @OnEvent('company.socialLink.deleted')
    async handleCompanySocialLinkDeleted(payload: any) {
        await this.audit.log({
            userId: payload.user.sub,
            companyId: payload.socialLink.companyId,
            action: 'COMPANY_SOCIAL_LINK_DELETED',
            entityType: 'company_social_link',
            entityId: payload.socialLink.id,
            metadata: { deleted: payload.socialLink },
            ipAddress: payload.req?.ip,
            userAgent: payload.req?.headers?.['user-agent'],
        });
    }

    @OnEvent('company.project.created')
    async handleCompanyProjectCreated(payload: any) {
        await this.audit.log({
            userId: payload.user.sub,
            companyId: payload.project.companyId,
            action: 'COMPANY_PROJECT_CREATED',
            entityType: 'project',
            entityId: payload.project.id,
            ipAddress: payload.req?.ip,
            userAgent: payload.req?.headers?.['user-agent'],
        });
    }

    @OnEvent('company.project.updated')
    async handleCompanyProjectUpdated(payload: any) {
        await this.audit.log({
            userId: payload.user.sub,
            companyId: payload.after.companyId,
            action: 'COMPANY_PROJECT_UPDATED',
            entityType: 'project',
            entityId: payload.after.id,
            metadata: {
                before: payload.before,
                after: payload.after,
            },
            ipAddress: payload.req?.ip,
            userAgent: payload.req?.headers?.['user-agent'],
        });
    }

    @OnEvent('company.project.deleted')
    async handleCompanyProjectDeleted(payload: any) {
        await this.audit.log({
            userId: payload.user.sub,
            companyId: payload.project.companyId,
            action: 'COMPANY_PROJECT_DELETED',
            entityType: 'project',
            entityId: payload.project.id,
            metadata: { deleted: payload.project },
            ipAddress: payload.req?.ip,
            userAgent: payload.req?.headers?.['user-agent'],
        });
    }
}
