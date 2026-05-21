import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../../../database/prisma/prisma.service';
import { PERMISSIONS, PermissionKey } from '../../constants/permissions.constants';
import { COMPANY_PERMISSION_KEY } from '../../decorators/company-permission.decorator';
import { PermissionResolverService } from '../../services/permission-resolver.service';

@Injectable()
export class CompanyAccessGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly prisma: PrismaService,
        private readonly permissionResolver: PermissionResolverService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const requiredPermission =
            this.reflector.getAllAndOverride<PermissionKey>(
                COMPANY_PERMISSION_KEY,
                [context.getHandler(), context.getClass()],
            ) ?? PERMISSIONS.COMPANY.MANAGE;

        if (
            await this.permissionResolver.hasAny(user, [
                PERMISSIONS.COMPANY.MANAGE,
                requiredPermission,
            ])
        ) {
            return true;
        }

        const companyId = await this.resolveCompanyId(request);
        if (!companyId) {
            throw new ForbiddenException('Company context is required');
        }

        const membership = await this.prisma.companyMember.findUnique({
            where: {
                companyId_userId: {
                    companyId,
                    userId: user.sub,
                },
            },
            include: {
                role: {
                    include: {
                        permissions: {
                            include: { permission: true },
                        },
                    },
                },
            },
        });

        if (!membership) {
            throw new ForbiddenException('Company access denied');
        }

        if (membership.isOwner) {
            return true;
        }

        const permissions =
            membership.role?.permissions.map((item) => item.permission.key) ??
            [];

        if (this.hasPermission(new Set(permissions), requiredPermission)) {
            return true;
        }

        throw new ForbiddenException(
            `Missing company permission: ${requiredPermission}`,
        );
    }

    private async resolveCompanyId(request: any) {
        const params = request.params ?? {};
        const body = request.body ?? {};
        const query = request.query ?? {};

        if (params.companyId) return params.companyId;
        if (body.companyId) return body.companyId;
        if (query.companyId) return query.companyId;

        if (params.companySlug || params.slug) {
            const company = await this.prisma.company.findFirst({
                where: {
                    slug: params.companySlug ?? params.slug,
                    deletedAt: null,
                },
                select: { id: true },
            });

            if (!company) throw new NotFoundException('Company not found');
            return company.id;
        }

        if (params.memberId) {
            const member = await this.prisma.companyMember.findUnique({
                where: { id: params.memberId },
                select: { companyId: true },
            });

            if (!member) throw new NotFoundException('Company member not found');
            return member.companyId;
        }

        return undefined;
    }

    private hasPermission(userPermissions: Set<string>, required: string) {
        if (userPermissions.has(required) || userPermissions.has('*')) {
            return true;
        }

        const [resource] = required.split('.');
        return Boolean(resource && userPermissions.has(`${resource}.manage`));
    }
}
