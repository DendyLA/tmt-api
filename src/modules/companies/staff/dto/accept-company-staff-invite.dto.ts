import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class AcceptCompanyStaffInviteDto {
    @ApiProperty({ example: 'plain-invite-token' })
    @IsString()
    token: string;

    @ApiPropertyOptional({ example: 'New Manager' })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional({ example: 'StrongPass123' })
    @IsOptional()
    @IsString()
    @MinLength(8)
    password?: string;
}
