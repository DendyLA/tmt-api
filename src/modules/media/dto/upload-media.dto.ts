import { ApiPropertyOptional } from '@nestjs/swagger';
import { Locale } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
    IsBoolean,
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
    MaxLength,
    Min,
} from 'class-validator';

function toBoolean(value: unknown) {
    if (value === undefined || value === null || value === '') return undefined;
    if (value === true || value === 'true') return true;
    if (value === false || value === 'false') return false;
    return value;
}

function toNumber(value: unknown) {
    if (value === undefined || value === null || value === '') return undefined;
    return Number(value);
}

export class UploadMediaDto {
    @ApiPropertyOptional({ example: 'company-id' })
    @IsOptional()
    @IsString()
    companyId?: string;

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
    @Transform(({ value }) => toBoolean(value))
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
    @Transform(({ value }) => toNumber(value))
    @IsOptional()
    @IsInt()
    @Min(0)
    sortOrder?: number;
}
