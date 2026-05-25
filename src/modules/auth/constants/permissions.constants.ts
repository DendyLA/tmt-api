export const PERMISSIONS = {
    VACANCY: {
        CREATE: 'vacancy.create',
        UPDATE: 'vacancy.update',
        DELETE: 'vacancy.delete',
        APPROVE: 'vacancy.approve',
        REJECT: 'vacancy.reject',
        ARCHIVE: 'vacancy.archive',
        RESTORE: 'vacancy.restore',
        ROLLBACK: 'vacancy.rollback',
        MANAGE: 'vacancy.manage',
    },
    COMPANY: {
        CREATE: 'company.create',
        UPDATE: 'company.update',
        DELETE: 'company.delete',
        CONTACT_MANAGE: 'company.contact.manage',
        SOCIAL_MANAGE: 'company.social.manage',
        PROJECT_MANAGE: 'company.project.manage',
        SERVICE_MANAGE: 'company.service.manage',
        PARTNER_MANAGE: 'company.partner.manage',
        STAFF_MANAGE: 'company.staff.manage',
        SITE_SETTINGS_MANAGE: 'company.siteSettings.manage',
        MANAGE: 'company.manage',
    },
    POST: {
        CREATE: 'post.create',
        UPDATE: 'post.update',
        DELETE: 'post.delete',
        PUBLISH: 'post.publish',
        MANAGE: 'post.manage',
    },
    MEDIA: {
        CREATE: 'media.create',
        UPDATE: 'media.update',
        DELETE: 'media.delete',
        MANAGE: 'media.manage',
    },
    TAG: {
        CREATE: 'tag.create',
        UPDATE: 'tag.update',
        DELETE: 'tag.delete',
        MANAGE: 'tag.manage',
    },
    CONTENT_VERSION: {
        READ: 'contentVersion.read',
        ROLLBACK: 'contentVersion.rollback',
    },
    AD: {
        CREATE: 'ad.create',
        UPDATE: 'ad.update',
        DELETE: 'ad.delete',
        MANAGE: 'ad.manage',
    },
    USERS: {
        MANAGE: 'users.manage',
    },
    ADMIN: {
        DASHBOARD_READ: 'admin.dashboard.read',
        MODERATION_READ: 'admin.moderation.read',
        RBAC_MANAGE: 'admin.rbac.manage',
    },
} as const;

export const ALL_PERMISSIONS = [
    PERMISSIONS.VACANCY.CREATE,
    PERMISSIONS.VACANCY.UPDATE,
    PERMISSIONS.VACANCY.DELETE,
    PERMISSIONS.VACANCY.APPROVE,
    PERMISSIONS.VACANCY.REJECT,
    PERMISSIONS.VACANCY.ARCHIVE,
    PERMISSIONS.VACANCY.RESTORE,
    PERMISSIONS.VACANCY.ROLLBACK,
    PERMISSIONS.VACANCY.MANAGE,
    PERMISSIONS.COMPANY.CREATE,
    PERMISSIONS.COMPANY.UPDATE,
    PERMISSIONS.COMPANY.DELETE,
    PERMISSIONS.COMPANY.CONTACT_MANAGE,
    PERMISSIONS.COMPANY.SOCIAL_MANAGE,
    PERMISSIONS.COMPANY.PROJECT_MANAGE,
    PERMISSIONS.COMPANY.SERVICE_MANAGE,
    PERMISSIONS.COMPANY.PARTNER_MANAGE,
    PERMISSIONS.COMPANY.STAFF_MANAGE,
    PERMISSIONS.COMPANY.SITE_SETTINGS_MANAGE,
    PERMISSIONS.COMPANY.MANAGE,
    PERMISSIONS.POST.CREATE,
    PERMISSIONS.POST.UPDATE,
    PERMISSIONS.POST.DELETE,
    PERMISSIONS.POST.PUBLISH,
    PERMISSIONS.POST.MANAGE,
    PERMISSIONS.MEDIA.CREATE,
    PERMISSIONS.MEDIA.UPDATE,
    PERMISSIONS.MEDIA.DELETE,
    PERMISSIONS.MEDIA.MANAGE,
    PERMISSIONS.TAG.CREATE,
    PERMISSIONS.TAG.UPDATE,
    PERMISSIONS.TAG.DELETE,
    PERMISSIONS.TAG.MANAGE,
    PERMISSIONS.CONTENT_VERSION.READ,
    PERMISSIONS.CONTENT_VERSION.ROLLBACK,
    PERMISSIONS.AD.CREATE,
    PERMISSIONS.AD.UPDATE,
    PERMISSIONS.AD.DELETE,
    PERMISSIONS.AD.MANAGE,
    PERMISSIONS.USERS.MANAGE,
    PERMISSIONS.ADMIN.DASHBOARD_READ,
    PERMISSIONS.ADMIN.MODERATION_READ,
    PERMISSIONS.ADMIN.RBAC_MANAGE,
] as const;

export type PermissionKey = (typeof ALL_PERMISSIONS)[number];

export const PERMISSION_DEFINITIONS: Record<
    PermissionKey,
    { description: string; group: string }
> = {
    [PERMISSIONS.VACANCY.CREATE]: {
        group: 'vacancy',
        description: 'Create vacancies',
    },
    [PERMISSIONS.VACANCY.UPDATE]: {
        group: 'vacancy',
        description: 'Update own or allowed vacancies',
    },
    [PERMISSIONS.VACANCY.DELETE]: {
        group: 'vacancy',
        description: 'Soft delete own or allowed vacancies',
    },
    [PERMISSIONS.VACANCY.APPROVE]: {
        group: 'vacancy',
        description: 'Approve vacancy moderation queue items',
    },
    [PERMISSIONS.VACANCY.REJECT]: {
        group: 'vacancy',
        description: 'Reject vacancy moderation queue items',
    },
    [PERMISSIONS.VACANCY.ARCHIVE]: {
        group: 'vacancy',
        description: 'Archive vacancies',
    },
    [PERMISSIONS.VACANCY.RESTORE]: {
        group: 'vacancy',
        description: 'Restore soft-deleted vacancies',
    },
    [PERMISSIONS.VACANCY.ROLLBACK]: {
        group: 'vacancy',
        description: 'Rollback vacancy versions',
    },
    [PERMISSIONS.VACANCY.MANAGE]: {
        group: 'vacancy',
        description: 'Manage all vacancies',
    },
    [PERMISSIONS.COMPANY.CREATE]: {
        group: 'company',
        description: 'Create companies',
    },
    [PERMISSIONS.COMPANY.UPDATE]: {
        group: 'company',
        description: 'Update company profile data',
    },
    [PERMISSIONS.COMPANY.DELETE]: {
        group: 'company',
        description: 'Soft delete companies',
    },
    [PERMISSIONS.COMPANY.CONTACT_MANAGE]: {
        group: 'company',
        description: 'Manage company contacts',
    },
    [PERMISSIONS.COMPANY.SOCIAL_MANAGE]: {
        group: 'company',
        description: 'Manage company social links',
    },
    [PERMISSIONS.COMPANY.PROJECT_MANAGE]: {
        group: 'company',
        description: 'Manage company projects',
    },
    [PERMISSIONS.COMPANY.SERVICE_MANAGE]: {
        group: 'company',
        description: 'Manage company services',
    },
    [PERMISSIONS.COMPANY.PARTNER_MANAGE]: {
        group: 'company',
        description: 'Manage company partners',
    },
    [PERMISSIONS.COMPANY.STAFF_MANAGE]: {
        group: 'company',
        description: 'Manage company staff',
    },
    [PERMISSIONS.COMPANY.SITE_SETTINGS_MANAGE]: {
        group: 'company',
        description: 'Manage company site settings',
    },
    [PERMISSIONS.COMPANY.MANAGE]: {
        group: 'company',
        description: 'Manage all company-owned content',
    },
    [PERMISSIONS.POST.CREATE]: {
        group: 'post',
        description: 'Create posts',
    },
    [PERMISSIONS.POST.UPDATE]: {
        group: 'post',
        description: 'Update posts',
    },
    [PERMISSIONS.POST.DELETE]: {
        group: 'post',
        description: 'Soft delete posts',
    },
    [PERMISSIONS.POST.PUBLISH]: {
        group: 'post',
        description: 'Publish posts',
    },
    [PERMISSIONS.POST.MANAGE]: {
        group: 'post',
        description: 'Manage all posts',
    },
    [PERMISSIONS.MEDIA.CREATE]: {
        group: 'media',
        description: 'Create media metadata',
    },
    [PERMISSIONS.MEDIA.UPDATE]: {
        group: 'media',
        description: 'Update media metadata',
    },
    [PERMISSIONS.MEDIA.DELETE]: {
        group: 'media',
        description: 'Soft delete media',
    },
    [PERMISSIONS.MEDIA.MANAGE]: {
        group: 'media',
        description: 'Manage media library and cleanup',
    },
    [PERMISSIONS.TAG.CREATE]: {
        group: 'tag',
        description: 'Create tags',
    },
    [PERMISSIONS.TAG.UPDATE]: {
        group: 'tag',
        description: 'Update tags',
    },
    [PERMISSIONS.TAG.DELETE]: {
        group: 'tag',
        description: 'Delete tags',
    },
    [PERMISSIONS.TAG.MANAGE]: {
        group: 'tag',
        description: 'Manage tags',
    },
    [PERMISSIONS.CONTENT_VERSION.READ]: {
        group: 'contentVersion',
        description: 'Read content versions',
    },
    [PERMISSIONS.CONTENT_VERSION.ROLLBACK]: {
        group: 'contentVersion',
        description: 'Rollback content versions',
    },
    [PERMISSIONS.AD.CREATE]: {
        group: 'ad',
        description: 'Create ads and ad spaces',
    },
    [PERMISSIONS.AD.UPDATE]: {
        group: 'ad',
        description: 'Update ads and ad spaces',
    },
    [PERMISSIONS.AD.DELETE]: {
        group: 'ad',
        description: 'Soft delete ads and ad spaces',
    },
    [PERMISSIONS.AD.MANAGE]: {
        group: 'ad',
        description: 'Manage ad placements and metrics',
    },
    [PERMISSIONS.USERS.MANAGE]: {
        group: 'users',
        description: 'Manage users',
    },
    [PERMISSIONS.ADMIN.DASHBOARD_READ]: {
        group: 'admin',
        description: 'Read admin dashboard',
    },
    [PERMISSIONS.ADMIN.MODERATION_READ]: {
        group: 'admin',
        description: 'Read moderation queues',
    },
    [PERMISSIONS.ADMIN.RBAC_MANAGE]: {
        group: 'admin',
        description: 'Manage roles and permissions',
    },
};

export const ROLE_NAMES = {
    SUPERADMIN: 'superadmin',
    ADMIN: 'admin',
    USER: 'user',
} as const;

export const ROLE_PERMISSION_MATRIX: Record<string, readonly PermissionKey[]> = {
    [ROLE_NAMES.SUPERADMIN]: ALL_PERMISSIONS,
    [ROLE_NAMES.ADMIN]: [
        PERMISSIONS.VACANCY.APPROVE,
        PERMISSIONS.VACANCY.REJECT,
        PERMISSIONS.VACANCY.ARCHIVE,
        PERMISSIONS.VACANCY.MANAGE,
        PERMISSIONS.COMPANY.CREATE,
        PERMISSIONS.COMPANY.UPDATE,
        PERMISSIONS.COMPANY.DELETE,
        PERMISSIONS.COMPANY.CONTACT_MANAGE,
        PERMISSIONS.COMPANY.SOCIAL_MANAGE,
        PERMISSIONS.COMPANY.PROJECT_MANAGE,
        PERMISSIONS.COMPANY.SERVICE_MANAGE,
        PERMISSIONS.COMPANY.PARTNER_MANAGE,
        PERMISSIONS.COMPANY.STAFF_MANAGE,
        PERMISSIONS.COMPANY.SITE_SETTINGS_MANAGE,
        PERMISSIONS.COMPANY.MANAGE,
        PERMISSIONS.POST.CREATE,
        PERMISSIONS.POST.UPDATE,
        PERMISSIONS.POST.DELETE,
        PERMISSIONS.POST.PUBLISH,
        PERMISSIONS.POST.MANAGE,
        PERMISSIONS.MEDIA.CREATE,
        PERMISSIONS.MEDIA.UPDATE,
        PERMISSIONS.MEDIA.DELETE,
        PERMISSIONS.MEDIA.MANAGE,
        PERMISSIONS.TAG.CREATE,
        PERMISSIONS.TAG.UPDATE,
        PERMISSIONS.TAG.DELETE,
        PERMISSIONS.TAG.MANAGE,
        PERMISSIONS.CONTENT_VERSION.READ,
        PERMISSIONS.CONTENT_VERSION.ROLLBACK,
        PERMISSIONS.AD.CREATE,
        PERMISSIONS.AD.UPDATE,
        PERMISSIONS.AD.DELETE,
        PERMISSIONS.AD.MANAGE,
        PERMISSIONS.ADMIN.DASHBOARD_READ,
        PERMISSIONS.ADMIN.MODERATION_READ,
    ],
    [ROLE_NAMES.USER]: [
        PERMISSIONS.VACANCY.CREATE,
        PERMISSIONS.VACANCY.UPDATE,
        PERMISSIONS.VACANCY.DELETE,
    ],
};
