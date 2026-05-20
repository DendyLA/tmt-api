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
    PERMISSIONS.USERS.MANAGE,
] as const;

export type PermissionKey = (typeof ALL_PERMISSIONS)[number];
