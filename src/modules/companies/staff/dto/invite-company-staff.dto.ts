import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';

export class InviteCompanyStaffDto {
    @ApiPropertyOptional({ example: 'user-id' })
    @IsOptional()
    @IsString()
    userId?: string;

    @ApiPropertyOptional({ example: 'manager@company.tm' })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiPropertyOptional({ example: 'role-id' })
    @IsOptional()
    @IsString()
    roleId?: string;

    @ApiPropertyOptional({ example: false, default: false })
    @IsOptional()
    @IsBoolean()
    isOwner?: boolean;
}
