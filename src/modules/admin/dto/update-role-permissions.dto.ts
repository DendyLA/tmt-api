import { ApiProperty } from '@nestjs/swagger';
import { ArrayUnique, IsArray, IsString } from 'class-validator';
import { PermissionKey } from '../../auth/constants/permissions.constants';

export class UpdateRolePermissionsDto {
    @ApiProperty({
        example: ['post.create', 'post.manage', 'media.manage'],
        type: [String],
    })
    @IsArray()
    @ArrayUnique()
    @IsString({ each: true })
    permissionKeys: PermissionKey[];
}
