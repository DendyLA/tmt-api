import { ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsBoolean,
    IsInt,
    IsOptional,
    IsString,
    Matches,
    MaxLength,
    Min,
} from 'class-validator';

export class UpsertCompanySiteSettingsDto {
    @ApiPropertyOptional({ example: 'company.tm' })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    @Matches(/^[a-z0-9.-]+$/)
    domain?: string | null;

    @ApiPropertyOptional({ example: true, default: true })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @ApiPropertyOptional({ example: 10, default: 0 })
    @IsOptional()
    @IsInt()
    @Min(0)
    sortOrder?: number;
}
