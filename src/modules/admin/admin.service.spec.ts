import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PERMISSIONS } from '../auth/constants/permissions.constants';
import { AdminService } from './admin.service';

describe('AdminService RBAC', () => {
    let prisma: any;
    let eventEmitter: { emit: jest.Mock };
    let service: AdminService;

    beforeEach(() => {
        prisma = {
            user: { count: jest.fn() },
            refreshToken: { updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
            company: { count: jest.fn() },
            post: { count: jest.fn(), findMany: jest.fn() },
            vacancy: { count: jest.fn(), findMany: jest.fn() },
            media: { count: jest.fn(), findMany: jest.fn() },
            ad: { count: jest.fn() },
            activityLog: { findMany: jest.fn(), count: jest.fn() },
            permission: { findMany: jest.fn() },
            role: { findMany: jest.fn(), findUnique: jest.fn() },
            rolePermission: {
                deleteMany: jest.fn().mockReturnValue({ operation: 'deleteMany' }),
                createMany: jest.fn().mockReturnValue({ operation: 'createMany' }),
            },
            $transaction: jest.fn().mockResolvedValue([]),
        };
        eventEmitter = { emit: jest.fn() };

        service = new AdminService(prisma, eventEmitter as any);
    });

    it('lists admin users with filters', async () => {
        const user = {
            id: 'user-1',
            name: 'Azat',
            email: 'azat@example.com',
            isBanned: false,
            bannedAt: null,
            createdAt: new Date(),
            role: { id: 'role-1', name: 'admin' },
        };
        prisma.user.findMany = jest.fn().mockResolvedValue([user]);
        prisma.user.count.mockResolvedValue(1);

        await expect(
            service.getUsers({ search: 'azat', role: 'admin', banned: false }),
        ).resolves.toEqual({
            data: [user],
            meta: { total: 1, page: 1, limit: 20, pages: 1 },
        });

        expect(prisma.user.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({
                    isBanned: false,
                    role: { name: 'admin' },
                }),
            }),
        );
    });

    it('bans user and revokes active sessions', async () => {
        const before = {
            id: 'user-1',
            name: 'Azat',
            email: 'azat@example.com',
            isBanned: false,
            bannedAt: null,
        };
        const after = {
            ...before,
            isBanned: true,
            bannedAt: new Date(),
        };
        prisma.user.findUnique = jest.fn().mockResolvedValue(before);
        prisma.user.update = jest.fn().mockResolvedValue(after);

        await expect(
            service.banUser(before.id, { sub: 'admin-1' }),
        ).resolves.toEqual(after);

        expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith({
            where: { userId: before.id, revokedAt: null },
            data: { revokedAt: expect.any(Date) },
        });
        expect(eventEmitter.emit).toHaveBeenCalledWith(
            'admin.user.banned',
            expect.objectContaining({ before, after }),
        );
    });

    it('lists permissions with group metadata', async () => {
        prisma.permission.findMany.mockResolvedValue([
            {
                id: 'permission-1',
                key: PERMISSIONS.POST.CREATE,
                description: null,
            },
        ]);

        await expect(service.getPermissions()).resolves.toEqual([
            {
                id: 'permission-1',
                key: PERMISSIONS.POST.CREATE,
                description: 'Create posts',
                group: 'post',
            },
        ]);
    });

    it('lists roles with sorted permissions', async () => {
        prisma.role.findMany.mockResolvedValue([
            {
                id: 'role-1',
                name: 'admin',
                permissions: [
                    {
                        permission: {
                            id: 'permission-2',
                            key: PERMISSIONS.MEDIA.MANAGE,
                            description: null,
                        },
                    },
                    {
                        permission: {
                            id: 'permission-1',
                            key: PERMISSIONS.POST.CREATE,
                            description: null,
                        },
                    },
                ],
            },
        ]);

        const roles = await service.getRoles();

        expect(roles[0].permissions.map((permission) => permission.key)).toEqual([
            PERMISSIONS.MEDIA.MANAGE,
            PERMISSIONS.POST.CREATE,
        ]);
    });

    it('replaces role permissions by keys', async () => {
        prisma.role.findUnique
            .mockResolvedValueOnce({ id: 'role-1' })
            .mockResolvedValueOnce({
                id: 'role-1',
                name: 'editor',
                permissions: [
                    {
                        permission: {
                            id: 'permission-1',
                            key: PERMISSIONS.POST.CREATE,
                            description: null,
                        },
                    },
                ],
            });
        prisma.permission.findMany.mockResolvedValue([
            { id: 'permission-1', key: PERMISSIONS.POST.CREATE },
        ]);

        await expect(
            service.updateRolePermissions('role-1', {
                permissionKeys: [PERMISSIONS.POST.CREATE],
            }),
        ).resolves.toMatchObject({
            id: 'role-1',
            permissions: [{ key: PERMISSIONS.POST.CREATE }],
        });

        expect(prisma.rolePermission.deleteMany).toHaveBeenCalledWith({
            where: { roleId: 'role-1' },
        });
        expect(prisma.rolePermission.createMany).toHaveBeenCalledWith({
            data: [{ roleId: 'role-1', permissionId: 'permission-1' }],
            skipDuplicates: true,
        });
        expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    });

    it('rejects unknown permission keys', async () => {
        prisma.role.findUnique.mockResolvedValue({ id: 'role-1' });

        await expect(
            service.updateRolePermissions('role-1', {
                permissionKeys: ['unknown.permission' as any],
            }),
        ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects missing roles', async () => {
        prisma.role.findUnique.mockResolvedValue(null);

        await expect(
            service.updateRolePermissions('missing-role', {
                permissionKeys: [PERMISSIONS.POST.CREATE],
            }),
        ).rejects.toBeInstanceOf(NotFoundException);
    });
});
