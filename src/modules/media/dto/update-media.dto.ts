import { MediaType } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';
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

export class UpdateMediaDto {
    @ApiPropertyOptional({ example: 'company-id' })
    @IsOptional()
    @IsString()
    companyId?: string | null;

    @ApiPropertyOptional({ example: 'https://cdn.tmt.tm/media/image.jpg' })
    @IsOptional()
    @IsUrl({ require_tld: false })
    @MaxLength(1000)
    url?: string;

    @ApiPropertyOptional({ enum: MediaType })
    @IsOptional()
    @IsEnum(MediaType)
    type?: MediaType;

    @ApiPropertyOptional({ example: 'post' })
    @IsOptional()
    @IsString()
    @MaxLength(80)
    entityType?: string | null;

    @ApiPropertyOptional({ example: 'entity-id' })
    @IsOptional()
    @IsString()
    entityId?: string | null;

    @ApiPropertyOptional({ example: true })
    @IsOptional()
    @IsBoolean()
    isGlobal?: boolean;

    @ApiPropertyOptional({ example: 'Hero image alt text' })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    altText?: string | null;

    @ApiPropertyOptional({ example: 'Hero image' })
    @IsOptional()
    @IsString()
    @MaxLength(180)
    title?: string | null;

    @ApiPropertyOptional({ example: 10 })
    @IsOptional()
    @IsInt()
    @Min(0)
    sortOrder?: number;
}
