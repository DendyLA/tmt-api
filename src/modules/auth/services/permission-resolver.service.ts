import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { AuthenticatedUser } from '../types/authenticated-user.type';
import { PermissionKey } from '../constants/permissions.constants';

@Injectable()
export class PermissionResolverService {
    constructor(private readonly prisma: PrismaService) {}

    async hasAll(
        user: AuthenticatedUser | null | undefined,
        requiredPermissions: readonly PermissionKey[],
    ): Promise<boolean> {
        if (!requiredPermissions.length) return true;
        if (!user?.sub) return false;

        const userPermissions = await this.resolveUserPermissions(user);

        return requiredPermissions.every((permission) =>
            this.hasPermission(userPermissions, permission),
        );
    }

    async hasAny(
        user: AuthenticatedUser | null | undefined,
        requiredPermissions: readonly PermissionKey[],
    ): Promise<boolean> {
        if (!requiredPermissions.length) return true;
        if (!user?.sub) return false;

        const userPermissions = await this.resolveUserPermissions(user);

        return requiredPermissions.some((permission) =>
            this.hasPermission(userPermissions, permission),
        );
    }

    async hasOne(
        user: AuthenticatedUser | null | undefined,
        permission: PermissionKey,
    ): Promise<boolean> {
        return this.hasAny(user, [permission]);
    }

    private async resolveUserPermissions(
        user: AuthenticatedUser,
    ): Promise<Set<string>> {
        if (Array.isArray(user.permissions) && user.permissions.length > 0) {
            return new Set(user.permissions);
        }

        const freshUser = await this.prisma.user.findUnique({
            where: { id: user.sub },
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

        const permissions =
            freshUser?.role?.permissions.map((item) => item.permission.key) ??
            [];

        return new Set(permissions);
    }

    private hasPermission(userPermissions: Set<string>, required: string) {
        if (userPermissions.has(required) || userPermissions.has('*')) {
            return true;
        }

        const [resource] = required.split('.');
        return Boolean(resource && userPermissions.has(`${resource}.manage`));
    }
}
