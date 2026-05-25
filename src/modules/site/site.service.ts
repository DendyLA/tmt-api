import { Injectable, NotFoundException } from '@nestjs/common';
import { Locale, PostStatus, ProjectStatus } from '@prisma/client';
import {
    localizeEntities,
    localizeEntity,
    resolveTranslation,
} from '../../common/utils/translation.util';
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

    async getHomeByDomain(domainOrHost?: string, locale?: Locale) {
        const resolved = await this.resolveByDomain(domainOrHost);
        return this.getHome(resolved.company.slug, locale);
    }

    async getHome(companySlug: string, locale?: Locale) {
        const company = await this.prisma.company.findFirst({
            where: { slug: companySlug, deletedAt: null },
            include: {
                translations: true,
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
                    include: {
                        translations: true,
                        tags: { include: { tag: true } },
                    },
                    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
                    take: 6,
                },
                serviceCategories: {
                    where: { deletedAt: null },
                    include: { translations: true },
                    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
                },
                services: {
                    where: { deletedAt: null },
                    include: {
                        translations: true,
                        category: { include: { translations: true } },
                    },
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
                include: {
                    translations: true,
                    tags: { include: { tag: true } },
                },
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
                    AND: [
                        { OR: [{ isGlobal: true }, { companyId: company.id }] },
                        locale ? { OR: [{ locale: null }, { locale }] } : {},
                    ],
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
            company: {
                ...localizeEntity(company, locale),
                projects: localizeEntities(company.projects ?? [], locale),
                serviceCategories: localizeEntities(
                    company.serviceCategories ?? [],
                    locale,
                ),
                services: localizeEntities(company.services ?? [], locale).map(
                    (service) => ({
                        ...service,
                        category: service.category
                            ? {
                                  ...service.category,
                                  translation: resolveTranslation(
                                      service.category.translations,
                                      locale,
                                  ),
                              }
                            : null,
                    }),
                ),
            },
            latestPosts: localizeEntities(latestPosts, locale),
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
