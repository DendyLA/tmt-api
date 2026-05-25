import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateCompanyStaffInviteDto {
    @ApiProperty({ example: 'manager@company.tm' })
    @IsEmail()
    email: string;

    @ApiPropertyOptional({ example: 'role-id' })
    @IsOptional()
    @IsString()
    roleId?: string;

    @ApiPropertyOptional({ example: false, default: false })
    @IsOptional()
    @IsBoolean()
    isOwner?: boolean;
}
