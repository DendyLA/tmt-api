import { SetMetadata } from '@nestjs/common';
import { PermissionKey } from '../constants/permissions.constants';

export const PERMISSIONS_KEY = 'auth:permissions';

export const Permissions = (...permissions: PermissionKey[]) =>
    SetMetadata(PERMISSIONS_KEY, permissions);
