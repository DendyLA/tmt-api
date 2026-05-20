import {
    CanActivate,
    ExecutionContext,
    Injectable,
    ForbiddenException,
    UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../../decorators/permissions.decorator';
import { PermissionResolverService } from '../../services/permission-resolver.service';
import { PermissionKey } from '../../constants/permissions.constants';

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly permissionResolver: PermissionResolverService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredPermissions = this.reflector.getAllAndOverride<
            PermissionKey[]
        >(PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);

        if (!requiredPermissions?.length) return true;

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user) {
            throw new UnauthorizedException('User not authenticated');
        }

        const hasPermission = await this.permissionResolver.hasAll(
            user,
            requiredPermissions,
        );

        if (!hasPermission) {
            throw new ForbiddenException(
                `Missing permissions: ${requiredPermissions.join(', ')}`,
            );
        }

        return true;
    }
}
