import { SetMetadata } from '@nestjs/common';

/**
 * @deprecated Use @Permissions() instead.
 */
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
