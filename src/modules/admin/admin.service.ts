import { Injectable } from '@nestjs/common';
import { PostStatus, Prisma, VacancyStatus } from '@prisma/client';
import {
    getPagination,
    paginatedResponse,
    PaginationQueryDto,
} from '../../common/dto/pagination-query.dto';
import { PrismaService } from '../../database/prisma/prisma.service';

@Injectable()
export class AdminService {
    constructor(private readonly prisma: PrismaService) {}

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
}
