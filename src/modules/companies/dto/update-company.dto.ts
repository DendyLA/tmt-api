import { ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsOptional,
    IsString,
    IsUrl,
    Matches,
    MaxLength,
    MinLength,
} from 'class-validator';

export class UpdateCompanyDto {
    @ApiPropertyOptional({ example: 'TMT Group' })
    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(120)
    name?: string;

    @ApiPropertyOptional({ example: 'tmt-group' })
    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(80)
    @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    slug?: string;

    @ApiPropertyOptional({ example: 'Group company profile description' })
    @IsOptional()
    @IsString()
    @MaxLength(5000)
    description?: string;

    @ApiPropertyOptional({ example: 'https://cdn.tmt.tm/logos/tmt.svg' })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    logo?: string;

    @ApiPropertyOptional({ example: 'https://tmt.tm' })
    @IsOptional()
    @IsUrl({ require_tld: false })
    @MaxLength(500)
    website?: string;
}
