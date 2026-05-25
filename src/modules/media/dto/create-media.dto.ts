import { Locale, MediaType } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsBoolean,
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
    IsUrl,
    MaxLength,
    Min,
} from 'class-validator';

export class CreateMediaDto {
    @ApiPropertyOptional({ example: 'company-id' })
    @IsOptional()
    @IsString()
    companyId?: string;

    @ApiProperty({ example: 'https://cdn.tmt.tm/media/image.jpg' })
    @IsUrl({ require_tld: false })
    @MaxLength(1000)
    url!: string;

    @ApiProperty({ enum: MediaType })
    @IsEnum(MediaType)
    type!: MediaType;

    @ApiPropertyOptional({ enum: Locale, example: Locale.RU })
    @IsOptional()
    @IsEnum(Locale)
    locale?: Locale;

    @ApiPropertyOptional({ example: 'post' })
    @IsOptional()
    @IsString()
    @MaxLength(80)
    entityType?: string;

    @ApiPropertyOptional({ example: 'entity-id' })
    @IsOptional()
    @IsString()
    entityId?: string;

    @ApiPropertyOptional({ example: true, default: false })
    @IsOptional()
    @IsBoolean()
    isGlobal?: boolean;

    @ApiPropertyOptional({ example: 'Hero image alt text' })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    altText?: string;

    @ApiPropertyOptional({ example: 'Hero image' })
    @IsOptional()
    @IsString()
    @MaxLength(180)
    title?: string;

    @ApiPropertyOptional({ example: 10, default: 0 })
    @IsOptional()
    @IsInt()
    @Min(0)
    sortOrder?: number;
}
