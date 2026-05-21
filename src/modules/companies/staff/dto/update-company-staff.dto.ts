import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateCompanyStaffDto {
    @ApiPropertyOptional({ example: 'role-id' })
    @IsOptional()
    @IsString()
    roleId?: string | null;

    @ApiPropertyOptional({ example: false })
    @IsOptional()
    @IsBoolean()
    isOwner?: boolean;
}
