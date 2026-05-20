import { ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsBoolean,
    IsInt,
    IsOptional,
    IsString,
    IsUrl,
    MaxLength,
    Min,
    MinLength,
} from 'class-validator';

export class UpdatePartnerDto {
    @ApiPropertyOptional({ example: 'Acme Corp' })
    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(160)
    name?: string;

    @ApiPropertyOptional({ example: 'https://acme.com' })
    @IsOptional()
    @IsUrl({ require_tld: false })
    @MaxLength(500)
    website?: string;

    @ApiPropertyOptional({ example: 'https://cdn.tmt.tm/partners/acme.svg' })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    logo?: string;

    @ApiPropertyOptional({ example: true })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @ApiPropertyOptional({ example: 10 })
    @IsOptional()
    @IsInt()
    @Min(0)
    sortOrder?: number;
}
