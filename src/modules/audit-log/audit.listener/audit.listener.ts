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

    @OnEvent('company.serviceCategory.created')
    async handleCompanyServiceCategoryCreated(payload: any) {
        await this.audit.log({
            userId: payload.user.sub,
            companyId: payload.category.companyId,
            action: 'COMPANY_SERVICE_CATEGORY_CREATED',
            entityType: 'service_category',
            entityId: payload.category.id,
            ipAddress: payload.req?.ip,
            userAgent: payload.req?.headers?.['user-agent'],
        });
    }

    @OnEvent('company.serviceCategory.updated')
    async handleCompanyServiceCategoryUpdated(payload: any) {
        await this.audit.log({
            userId: payload.user.sub,
            companyId: payload.after.companyId,
            action: 'COMPANY_SERVICE_CATEGORY_UPDATED',
            entityType: 'service_category',
            entityId: payload.after.id,
            metadata: { before: payload.before, after: payload.after },
            ipAddress: payload.req?.ip,
            userAgent: payload.req?.headers?.['user-agent'],
        });
    }

    @OnEvent('company.serviceCategory.deleted')
    async handleCompanyServiceCategoryDeleted(payload: any) {
        await this.audit.log({
            userId: payload.user.sub,
            companyId: payload.category.companyId,
            action: 'COMPANY_SERVICE_CATEGORY_DELETED',
            entityType: 'service_category',
            entityId: payload.category.id,
            metadata: { deleted: payload.category },
            ipAddress: payload.req?.ip,
            userAgent: payload.req?.headers?.['user-agent'],
        });
    }

    @OnEvent('company.service.created')
    async handleCompanyServiceCreated(payload: any) {
        await this.audit.log({
            userId: payload.user.sub,
            companyId: payload.service.companyId,
            action: 'COMPANY_SERVICE_CREATED',
            entityType: 'service',
            entityId: payload.service.id,
            ipAddress: payload.req?.ip,
            userAgent: payload.req?.headers?.['user-agent'],
        });
    }

    @OnEvent('company.service.updated')
    async handleCompanyServiceUpdated(payload: any) {
        await this.audit.log({
            userId: payload.user.sub,
            companyId: payload.after.companyId,
            action: 'COMPANY_SERVICE_UPDATED',
            entityType: 'service',
            entityId: payload.after.id,
            metadata: { before: payload.before, after: payload.after },
            ipAddress: payload.req?.ip,
            userAgent: payload.req?.headers?.['user-agent'],
        });
    }

    @OnEvent('company.service.deleted')
    async handleCompanyServiceDeleted(payload: any) {
        await this.audit.log({
            userId: payload.user.sub,
            companyId: payload.service.companyId,
            action: 'COMPANY_SERVICE_DELETED',
            entityType: 'service',
            entityId: payload.service.id,
            metadata: { deleted: payload.service },
            ipAddress: payload.req?.ip,
            userAgent: payload.req?.headers?.['user-agent'],
        });
    }

    @OnEvent('company.partner.created')
    async handleCompanyPartnerCreated(payload: any) {
        await this.audit.log({
            userId: payload.user.sub,
            companyId: payload.partner.companyId,
            action: 'COMPANY_PARTNER_CREATED',
            entityType: 'partner',
            entityId: payload.partner.id,
            ipAddress: payload.req?.ip,
            userAgent: payload.req?.headers?.['user-agent'],
        });
    }

    @OnEvent('company.partner.updated')
    async handleCompanyPartnerUpdated(payload: any) {
        await this.audit.log({
            userId: payload.user.sub,
            companyId: payload.after.companyId,
            action: 'COMPANY_PARTNER_UPDATED',
            entityType: 'partner',
            entityId: payload.after.id,
            metadata: { before: payload.before, after: payload.after },
            ipAddress: payload.req?.ip,
            userAgent: payload.req?.headers?.['user-agent'],
        });
    }

    @OnEvent('company.partner.deleted')
    async handleCompanyPartnerDeleted(payload: any) {
        await this.audit.log({
            userId: payload.user.sub,
            companyId: payload.partner.companyId,
            action: 'COMPANY_PARTNER_DELETED',
            entityType: 'partner',
            entityId: payload.partner.id,
            metadata: { deleted: payload.partner },
            ipAddress: payload.req?.ip,
            userAgent: payload.req?.headers?.['user-agent'],
        });
    }

    @OnEvent('post.created')
    async handlePostCreated(payload: any) {
        await this.audit.log({
            userId: payload.user.sub,
            companyId: payload.post.companyId,
            action: 'POST_CREATED',
            entityType: 'post',
            entityId: payload.post.id,
            ipAddress: payload.req?.ip,
            userAgent: payload.req?.headers?.['user-agent'],
        });
    }

    @OnEvent('post.updated')
    async handlePostUpdated(payload: any) {
        await this.audit.log({
            userId: payload.user.sub,
            companyId: payload.after.companyId,
            action: 'POST_UPDATED',
            entityType: 'post',
            entityId: payload.after.id,
            metadata: {
                before: payload.before,
                after: payload.after,
            },
            ipAddress: payload.req?.ip,
            userAgent: payload.req?.headers?.['user-agent'],
        });
    }

    @OnEvent('post.published')
    async handlePostPublished(payload: any) {
        await this.audit.log({
            userId: payload.user.sub,
            companyId: payload.after.companyId,
            action: 'POST_PUBLISHED',
            entityType: 'post',
            entityId: payload.after.id,
            metadata: {
                before: payload.before,
                after: payload.after,
            },
            ipAddress: payload.req?.ip,
            userAgent: payload.req?.headers?.['user-agent'],
        });
    }

    @OnEvent('post.deleted')
    async handlePostDeleted(payload: any) {
        await this.audit.log({
            userId: payload.user.sub,
            companyId: payload.post.companyId,
            action: 'POST_DELETED',
            entityType: 'post',
            entityId: payload.post.id,
            metadata: { deleted: payload.post },
            ipAddress: payload.req?.ip,
            userAgent: payload.req?.headers?.['user-agent'],
        });
    }

    @OnEvent('media.created')
    async handleMediaCreated(payload: any) {
        await this.audit.log({
            userId: payload.user.sub,
            companyId: payload.media.companyId,
            action: 'MEDIA_CREATED',
            entityType: 'media',
            entityId: payload.media.id,
            ipAddress: payload.req?.ip,
            userAgent: payload.req?.headers?.['user-agent'],
        });
    }

    @OnEvent('media.updated')
    async handleMediaUpdated(payload: any) {
        await this.audit.log({
            userId: payload.user.sub,
            companyId: payload.after.companyId,
            action: 'MEDIA_UPDATED',
            entityType: 'media',
            entityId: payload.after.id,
            metadata: {
                before: payload.before,
                after: payload.after,
            },
            ipAddress: payload.req?.ip,
            userAgent: payload.req?.headers?.['user-agent'],
        });
    }

    @OnEvent('media.deleted')
    async handleMediaDeleted(payload: any) {
        await this.audit.log({
            userId: payload.user.sub,
            companyId: payload.media.companyId,
            action: 'MEDIA_DELETED',
            entityType: 'media',
            entityId: payload.media.id,
            metadata: { deleted: payload.media },
            ipAddress: payload.req?.ip,
            userAgent: payload.req?.headers?.['user-agent'],
        });
    }

    @OnEvent('admin.user.banned')
    async handleAdminUserBanned(payload: any) {
        await this.audit.log({
            userId: payload.user?.sub,
            action: 'USER_BANNED',
            entityType: 'user',
            entityId: payload.after.id,
            metadata: {
                before: payload.before,
                after: payload.after,
            },
            ipAddress: payload.req?.ip,
            userAgent: payload.req?.headers?.['user-agent'],
        });
    }

    @OnEvent('admin.user.unbanned')
    async handleAdminUserUnbanned(payload: any) {
        await this.audit.log({
            userId: payload.user?.sub,
            action: 'USER_UNBANNED',
            entityType: 'user',
            entityId: payload.after.id,
            metadata: {
                before: payload.before,
                after: payload.after,
            },
            ipAddress: payload.req?.ip,
            userAgent: payload.req?.headers?.['user-agent'],
        });
    }
}
