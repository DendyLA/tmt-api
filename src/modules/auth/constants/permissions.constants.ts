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
        MANAGE: 'company.manage',
    },
    USERS: {
        MANAGE: 'users.manage',
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
    PERMISSIONS.COMPANY.MANAGE,
    PERMISSIONS.USERS.MANAGE,
] as const;

export type PermissionKey = (typeof ALL_PERMISSIONS)[number];
