import { ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsInt,
    IsOptional,
    IsString,
    IsUrl,
    MaxLength,
    Min,
} from 'class-validator';

export class UpdateCompanySocialLinkDto {
    @ApiPropertyOptional({ example: 'instagram' })
    @IsOptional()
    @IsString()
    @MaxLength(80)
    platform?: string;

    @ApiPropertyOptional({ example: 'https://instagram.com/company' })
    @IsOptional()
    @IsUrl({ require_tld: false })
    @MaxLength(500)
    url?: string;

    @ApiPropertyOptional({ example: 'company' })
    @IsOptional()
    @IsString()
    @MaxLength(120)
    username?: string;

    @ApiPropertyOptional({ example: 10 })
    @IsOptional()
    @IsInt()
    @Min(0)
    sortOrder?: number;
}
