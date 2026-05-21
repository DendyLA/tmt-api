import { SetMetadata } from '@nestjs/common';
import { PermissionKey } from '../constants/permissions.constants';

export const COMPANY_PERMISSION_KEY = 'companyPermission';

export const CompanyPermission = (permission: PermissionKey) =>
    SetMetadata(COMPANY_PERMISSION_KEY, permission);
