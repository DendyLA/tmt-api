import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsInt,
    IsOptional,
    IsString,
    IsUrl,
    MaxLength,
    Min,
} from 'class-validator';

export class CreateCompanySocialLinkDto {
    @ApiProperty({ example: 'instagram' })
    @IsString()
    @MaxLength(80)
    platform!: string;

    @ApiProperty({ example: 'https://instagram.com/company' })
    @IsUrl({ require_tld: false })
    @MaxLength(500)
    url!: string;

    @ApiPropertyOptional({ example: 'company' })
    @IsOptional()
    @IsString()
    @MaxLength(120)
    username?: string;

    @ApiPropertyOptional({ example: 10, default: 0 })
    @IsOptional()
    @IsInt()
    @Min(0)
    sortOrder?: number;
}
