import { PERMISSIONS } from '../constants/permissions.constants';
import { AuthenticatedUser } from '../types/authenticated-user.type';
import { PermissionResolverService } from './permission-resolver.service';

describe('PermissionResolverService', () => {
    let prisma: {
        user: {
            findUnique: jest.Mock;
        };
    };
    let service: PermissionResolverService;

    const baseUser: AuthenticatedUser = {
        sub: 'user-1',
        email: 'user@example.com',
        role: 'user',
        permissions: [],
    };

    beforeEach(() => {
        prisma = {
            user: {
                findUnique: jest.fn(),
            },
        };

        service = new PermissionResolverService(prisma as any);
    });

    it('allows exact permissions from JWT snapshot', async () => {
        await expect(
            service.hasOne(
                {
                    ...baseUser,
                    permissions: [PERMISSIONS.VACANCY.UPDATE],
                },
                PERMISSIONS.VACANCY.UPDATE,
            ),
        ).resolves.toBe(true);

        expect(prisma.user.findUnique).not.toHaveBeenCalled();
    });

    it('allows resource manage permission for resource actions', async () => {
        await expect(
            service.hasOne(
                {
                    ...baseUser,
                    permissions: [PERMISSIONS.VACANCY.MANAGE],
                },
                PERMISSIONS.VACANCY.DELETE,
            ),
        ).resolves.toBe(true);
    });

    it('allows wildcard permission for any action', async () => {
        await expect(
            service.hasOne(
                {
                    ...baseUser,
                    permissions: ['*' as any],
                },
                PERMISSIONS.USERS.MANAGE,
            ),
        ).resolves.toBe(true);
    });

    it('returns false when user is missing', async () => {
        await expect(
            service.hasOne(null, PERMISSIONS.VACANCY.CREATE),
        ).resolves.toBe(false);
    });

    it('supports hasAll and hasAny checks', async () => {
        const user = {
            ...baseUser,
            permissions: [
                PERMISSIONS.VACANCY.CREATE,
                PERMISSIONS.VACANCY.UPDATE,
            ],
        };

        await expect(
            service.hasAll(user, [
                PERMISSIONS.VACANCY.CREATE,
                PERMISSIONS.VACANCY.UPDATE,
            ]),
        ).resolves.toBe(true);

        await expect(
            service.hasAll(user, [
                PERMISSIONS.VACANCY.CREATE,
                PERMISSIONS.VACANCY.DELETE,
            ]),
        ).resolves.toBe(false);

        await expect(
            service.hasAny(user, [
                PERMISSIONS.VACANCY.DELETE,
                PERMISSIONS.VACANCY.UPDATE,
            ]),
        ).resolves.toBe(true);
    });

    it('falls back to database permissions when JWT snapshot is empty', async () => {
        prisma.user.findUnique.mockResolvedValue({
            role: {
                permissions: [
                    {
                        permission: {
                            key: PERMISSIONS.VACANCY.RESTORE,
                        },
                    },
                ],
            },
        });

        await expect(
            service.hasOne(baseUser, PERMISSIONS.VACANCY.RESTORE),
        ).resolves.toBe(true);

        expect(prisma.user.findUnique).toHaveBeenCalledWith({
            where: { id: baseUser.sub },
            select: {
                role: {
                    select: {
                        permissions: {
                            select: {
                                permission: {
                                    select: {
                                        key: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
    });

    it('accepts permission context without changing global checks yet', async () => {
        await expect(
            service.hasOne(
                {
                    ...baseUser,
                    permissions: [PERMISSIONS.VACANCY.MANAGE],
                },
                PERMISSIONS.VACANCY.UPDATE,
                {
                    companyId: 'company-1',
                    entityType: 'vacancy',
                    entityId: 'vacancy-1',
                    ownerId: baseUser.sub,
                },
            ),
        ).resolves.toBe(true);
    });
});
