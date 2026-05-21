import { Injectable, NotFoundException } from '@nestjs/common';
import { PostStatus, ProjectStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma/prisma.service';

@Injectable()
export class SiteService {
    constructor(private readonly prisma: PrismaService) {}

    async resolveByDomain(domainOrHost?: string) {
        const domain = this.normalizeDomain(domainOrHost);
        if (!domain) {
            throw new NotFoundException('Company site not found');
        }

        const settings = await this.prisma.companySiteSettings.findFirst({
            where: {
                domain,
                isActive: true,
                company: { deletedAt: null },
            },
            include: {
                company: true,
            },
        });

        if (!settings) {
            throw new NotFoundException('Company site not found');
        }

        return {
            company: settings.company,
            siteSettings: {
                id: settings.id,
                domain: settings.domain,
                isActive: settings.isActive,
                sortOrder: settings.sortOrder,
            },
        };
    }

    async getHomeByDomain(domainOrHost?: string) {
        const resolved = await this.resolveByDomain(domainOrHost);
        return this.getHome(resolved.company.slug);
    }

    async getHome(companySlug: string) {
        const company = await this.prisma.company.findFirst({
            where: { slug: companySlug, deletedAt: null },
            include: {
                siteSettings: true,
                contact: true,
                socialLinks: {
                    where: { deletedAt: null },
                    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
                },
                projects: {
                    where: {
                        status: ProjectStatus.PUBLISHED,
                        deletedAt: null,
                    },
                    include: { tags: { include: { tag: true } } },
                    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
                    take: 6,
                },
                serviceCategories: {
                    where: { deletedAt: null },
                    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
                },
                services: {
                    where: { deletedAt: null },
                    include: { category: true },
                    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
                },
                partners: {
                    where: { isActive: true, deletedAt: null },
                    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
                },
            },
        });

        if (!company) {
            throw new NotFoundException('Company not found');
        }

        const [latestPosts, media, adPlacements] = await Promise.all([
            this.prisma.post.findMany({
                where: {
                    deletedAt: null,
                    status: PostStatus.PUBLISHED,
                    OR: [{ isGlobal: true }, { companyId: company.id }],
                },
                include: { tags: { include: { tag: true } } },
                orderBy: [
                    { sortOrder: 'asc' },
                    { publishedAt: 'desc' },
                    { createdAt: 'desc' },
                ],
                take: 6,
            }),
            this.prisma.media.findMany({
                where: {
                    deletedAt: null,
                    OR: [{ isGlobal: true }, { companyId: company.id }],
                },
                orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
                take: 24,
            }),
            this.prisma.adPlacement.findMany({
                where: {
                    deletedAt: null,
                    OR: [{ companyId: null }, { companyId: company.id }],
                    ad: {
                        deletedAt: null,
                        isActive: true,
                        OR: [{ isGlobal: true }, { companyId: company.id }],
                    },
                    space: {
                        deletedAt: null,
                        OR: [{ companyId: null }, { companyId: company.id }],
                    },
                },
                include: { ad: true, space: true },
                orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
            }),
        ]);

        return {
            company,
            latestPosts,
            media,
            adPlacements,
        };
    }

    private normalizeDomain(domainOrHost?: string) {
        if (!domainOrHost) return undefined;

        return domainOrHost
            .trim()
            .toLowerCase()
            .replace(/^https?:\/\//, '')
            .replace(/:\d+$/, '')
            .replace(/\/$/, '');
    }
}
