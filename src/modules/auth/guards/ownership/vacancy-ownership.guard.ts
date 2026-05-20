import {
    CanActivate,
    ExecutionContext,
    Injectable,
    ForbiddenException,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma/prisma.service';
import { PERMISSIONS } from '../../constants/permissions.constants';
import { PermissionResolverService } from '../../services/permission-resolver.service';

@Injectable()
export class VacancyOwnershipGuard implements CanActivate {
    constructor(
        private prisma: PrismaService,
        private permissionResolver: PermissionResolverService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest();
        const user = req.user;
        const id = req.params.id;

        if (!user) throw new UnauthorizedException();

        const vacancy = await this.prisma.vacancy.findUnique({
            where: { id },
            select: { userId: true },
        });

        if (!vacancy) throw new NotFoundException('Vacancy not found');

        const canManageVacancies = await this.permissionResolver.hasAll(user, [
            PERMISSIONS.VACANCY.MANAGE,
        ]);

        if (canManageVacancies) return true;

        if (vacancy.userId !== user.sub) {
            throw new ForbiddenException('Not your resource');
        }

        return true;
    }
}
