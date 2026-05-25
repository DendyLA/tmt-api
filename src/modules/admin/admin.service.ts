import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PostStatus, Prisma, VacancyStatus } from '@prisma/client';
import {
    getPagination,
    paginatedResponse,
    PaginationQueryDto,
} from '../../common/dto/pagination-query.dto';
import { PrismaService } from '../../database/prisma/prisma.service';
import {
    ALL_PERMISSIONS,
    PERMISSION_DEFINITIONS,
    PermissionKey,
} from '../auth/constants/permissions.constants';
import { ActivityLogsQueryDto } from './dto/activity-logs-query.dto';
import { AdminUsersQueryDto } from './dto/admin-users-query.dto';
import { UpdateRolePermissionsDto } from './dto/update-role-permissions.dto';

@Injectable()
export class AdminService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly eventEmitter: EventEmitter2,
    ) {}

    async getDashboard() {
        const [
            usersTotal,
            bannedUsersTotal,
            companiesTotal,
            postsTotal,
            publishedPostsTotal,
            pendingVacanciesTotal,
            mediaTotal,
            activeAdsTotal,
            latestActivity,
        ] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.user.count({ where: { isBanned: true } }),
            this.prisma.company.count({ where: { deletedAt: null } }),
            this.prisma.post.count({ where: { deletedAt: null } }),
            this.prisma.post.count({
                where: { deletedAt: null, status: PostStatus.PUBLISHED },
            }),
            this.prisma.vacancy.count({
                where: { deletedAt: null, status: VacancyStatus.PENDING },
            }),
            this.prisma.media.count({ where: { deletedAt: null } }),
            this.prisma.ad.count({
                where: { deletedAt: null, isActive: true },
            }),
            this.prisma.activityLog.findMany({
                take: 10,
                orderBy: { createdAt: 'desc' },
            }),
        ]);

        return {
            totals: {
                users: usersTotal,
                bannedUsers: bannedUsersTotal,
                companies: companiesTotal,
                posts: postsTotal,
                publishedPosts: publishedPostsTotal,
                pendingVacancies: pendingVacanciesTotal,
                media: mediaTotal,
                activeAds: activeAdsTotal,
            },
            latestActivity,
        };
    }

    async getModerationQueues(query: PaginationQueryDto = {}) {
        const { page, limit, skip, take } = getPagination(query);
        const vacancyWhere: Prisma.VacancyWhereInput = {
            deletedAt: null,
            status: VacancyStatus.PENDING,
            ...(query.search ? this.buildVacancySearch(query.search) : {}),
        };
        const postWhere: Prisma.PostWhereInput = {
            deletedAt: null,
            status: PostStatus.DRAFT,
            ...(query.search ? this.buildPostSearch(query.search) : {}),
        };
        const mediaWhere: Prisma.MediaWhereInput = {
            deletedAt: null,
            ...(query.search ? this.buildMediaSearch(query.search) : {}),
        };

        const [
            pendingVacancies,
            pendingVacanciesTotal,
            draftPosts,
            draftPostsTotal,
            recentMedia,
            recentMediaTotal,
        ] = await Promise.all([
            this.prisma.vacancy.findMany({
                where: vacancyWhere,
                include: {
                    user: { select: { id: true, name: true, email: true } },
                    company: { select: { id: true, name: true, slug: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take,
            }),
            this.prisma.vacancy.count({ where: vacancyWhere }),
            this.prisma.post.findMany({
                where: postWhere,
                include: {
                    company: { select: { id: true, name: true, slug: true } },
                    author: { select: { id: true, name: true, email: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take,
            }),
            this.prisma.post.count({ where: postWhere }),
            this.prisma.media.findMany({
                where: mediaWhere,
                include: {
                    company: { select: { id: true, name: true, slug: true } },
                    author: { select: { id: true, name: true, email: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take,
            }),
            this.prisma.media.count({ where: mediaWhere }),
        ]);

        return {
            pendingVacancies: paginatedResponse(
                pendingVacancies,
                pendingVacanciesTotal,
                page,
                limit,
            ),
            draftPosts: paginatedResponse(draftPosts, draftPostsTotal, page, limit),
            recentMedia: paginatedResponse(
                recentMedia,
                recentMediaTotal,
                page,
                limit,
            ),
        };
    }

    async getActivityLogs(query: ActivityLogsQueryDto = {}) {
        const { page, limit, skip, take } = getPagination(query);
        const where: Prisma.ActivityLogWhereInput = {
            ...(query.companyId ? { companyId: query.companyId } : {}),
            ...(query.userId ? { userId: query.userId } : {}),
            ...(query.action ? { action: query.action } : {}),
            ...(query.entityType ? { entityType: query.entityType } : {}),
            ...(query.entityId ? { entityId: query.entityId } : {}),
            ...(query.dateFrom || query.dateTo
                ? {
                      createdAt: {
                          ...(query.dateFrom ? { gte: new Date(query.dateFrom) } : {}),
                          ...(query.dateTo ? { lte: new Date(query.dateTo) } : {}),
                      },
                  }
                : {}),
        };

        const [data, total] = await Promise.all([
            this.prisma.activityLog.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take,
            }),
            this.prisma.activityLog.count({ where }),
        ]);

        return paginatedResponse(data, total, page, limit);
    }

    async getUsers(query: AdminUsersQueryDto = {}) {
        const { page, limit, skip, take } = getPagination(query);
        const where: Prisma.UserWhereInput = {
            ...(query.banned !== undefined ? { isBanned: query.banned } : {}),
            ...(query.role ? { role: { name: query.role } } : {}),
            ...(query.search
                ? {
                      OR: [
                          { name: { contains: query.search, mode: 'insensitive' } },
                          { email: { contains: query.search, mode: 'insensitive' } },
                      ],
                  }
                : {}),
        };

        const [data, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    isBanned: true,
                    bannedAt: true,
                    createdAt: true,
                    role: { select: { id: true, name: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take,
            }),
            this.prisma.user.count({ where }),
        ]);

        return paginatedResponse(data, total, page, limit);
    }

    async getUser(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                isBanned: true,
                bannedAt: true,
                createdAt: true,
                role: {
                    include: {
                        permissions: {
                            include: { permission: true },
                        },
                    },
                },
                companyMemberships: {
                    include: {
                        company: { select: { id: true, name: true, slug: true } },
                        role: { select: { id: true, name: true } },
                    },
                },
            },
        });

        if (!user) throw new NotFoundException('User not found');
        return user;
    }

    async banUser(id: string, actor: any, req?: any) {
        const before = await this.prisma.user.findUnique({ where: { id } });
        if (!before) throw new NotFoundException('User not found');

        const user = await this.prisma.user.update({
            where: { id },
            data: {
                isBanned: true,
                bannedAt: before.bannedAt ?? new Date(),
            },
            select: {
                id: true,
                name: true,
                email: true,
                isBanned: true,
                bannedAt: true,
                createdAt: true,
                role: { select: { id: true, name: true } },
            },
        });

        await this.prisma.refreshToken.updateMany({
            where: { userId: id, revokedAt: null },
            data: { revokedAt: new Date() },
        });

        this.eventEmitter.emit('admin.user.banned', {
            user: actor,
            before,
            after: user,
            req,
        });

        return user;
    }

    async unbanUser(id: string, actor: any, req?: any) {
        const before = await this.prisma.user.findUnique({ where: { id } });
        if (!before) throw new NotFoundException('User not found');

        const user = await this.prisma.user.update({
            where: { id },
            data: {
                isBanned: false,
                bannedAt: null,
            },
            select: {
                id: true,
                name: true,
                email: true,
                isBanned: true,
                bannedAt: true,
                createdAt: true,
                role: { select: { id: true, name: true } },
            },
        });

        this.eventEmitter.emit('admin.user.unbanned', {
            user: actor,
            before,
            after: user,
            req,
        });

        return user;
    }

    async getPermissions() {
        const permissions = await this.prisma.permission.findMany({
            orderBy: { key: 'asc' },
        });

        return permissions.map((permission) => {
            const definition =
                PERMISSION_DEFINITIONS[permission.key as PermissionKey];

            return {
                ...permission,
                group: definition?.group ?? permission.key.split('.')[0],
                description:
                    permission.description ?? definition?.description ?? null,
            };
        });
    }

    async getRoles() {
        const roles = await this.prisma.role.findMany({
            include: {
                permissions: {
                    include: { permission: true },
                },
            },
            orderBy: { name: 'asc' },
        });

        return roles.map((role) => ({
            id: role.id,
            name: role.name,
            permissions: role.permissions
                .map(({ permission }) => {
                    const definition =
                        PERMISSION_DEFINITIONS[permission.key as PermissionKey];

                    return {
                        ...permission,
                        group: definition?.group ?? permission.key.split('.')[0],
                        description:
                            permission.description ??
                            definition?.description ??
                            null,
                    };
                })
                .sort((a, b) => a.key.localeCompare(b.key)),
        }));
    }

    async updateRolePermissions(id: string, dto: UpdateRolePermissionsDto) {
        const role = await this.prisma.role.findUnique({
            where: { id },
            select: { id: true },
        });

        if (!role) throw new NotFoundException('Role not found');

        const uniqueKeys = [...new Set(dto.permissionKeys)];
        const unknownKeys = uniqueKeys.filter(
            (key) => !ALL_PERMISSIONS.includes(key as PermissionKey),
        );

        if (unknownKeys.length > 0) {
            throw new BadRequestException(
                `Unknown permissions: ${unknownKeys.join(', ')}`,
            );
        }

        const permissions = await this.prisma.permission.findMany({
            where: { key: { in: uniqueKeys } },
            select: { id: true, key: true },
        });

        if (permissions.length !== uniqueKeys.length) {
            const existingKeys = new Set(
                permissions.map((permission) => permission.key),
            );
            const missingKeys = uniqueKeys.filter((key) => !existingKeys.has(key));

            throw new BadRequestException(
                `Permissions are not seeded: ${missingKeys.join(', ')}`,
            );
        }

        await this.prisma.$transaction([
            this.prisma.rolePermission.deleteMany({ where: { roleId: id } }),
            this.prisma.rolePermission.createMany({
                data: permissions.map((permission) => ({
                    roleId: id,
                    permissionId: permission.id,
                })),
                skipDuplicates: true,
            }),
        ]);

        return this.getRoleById(id);
    }

    private buildVacancySearch(search: string): Prisma.VacancyWhereInput {
        return {
            OR: [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { location: { contains: search, mode: 'insensitive' } },
            ],
        };
    }

    private buildPostSearch(search: string): Prisma.PostWhereInput {
        return {
            OR: [
                { title: { contains: search, mode: 'insensitive' } },
                { excerpt: { contains: search, mode: 'insensitive' } },
                { content: { contains: search, mode: 'insensitive' } },
            ],
        };
    }

    private buildMediaSearch(search: string): Prisma.MediaWhereInput {
        return {
            OR: [
                { title: { contains: search, mode: 'insensitive' } },
                { altText: { contains: search, mode: 'insensitive' } },
                { url: { contains: search, mode: 'insensitive' } },
            ],
        };
    }

    private async getRoleById(id: string) {
        const role = await this.prisma.role.findUnique({
            where: { id },
            include: {
                permissions: {
                    include: { permission: true },
                },
            },
        });

        if (!role) throw new NotFoundException('Role not found');

        return {
            id: role.id,
            name: role.name,
            permissions: role.permissions
                .map(({ permission }) => {
                    const definition =
                        PERMISSION_DEFINITIONS[permission.key as PermissionKey];

                    return {
                        ...permission,
                        group: definition?.group ?? permission.key.split('.')[0],
                        description:
                            permission.description ??
                            definition?.description ??
                            null,
                    };
                })
                .sort((a, b) => a.key.localeCompare(b.key)),
        };
    }
}
