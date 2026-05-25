import { PostStatus, PostType } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsArray,
    IsBoolean,
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
    Matches,
    MaxLength,
    Min,
    MinLength,
    ValidateNested,
} from 'class-validator';
import { PostTranslationDto } from '../../../common/dto/content-translation.dto';
import { HasUniqueLocales } from '../../../common/validators/unique-locales.validator';

export class UpdatePostDto {
    @ApiPropertyOptional({ example: 'company-id' })
    @IsOptional()
    @IsString()
    companyId?: string | null;

    @ApiPropertyOptional({ example: 'Group launches new digital platform' })
    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(180)
    title?: string;

    @ApiPropertyOptional({ example: 'group-launches-new-digital-platform' })
    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(120)
    @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    slug?: string;

    @ApiPropertyOptional({ example: 'Short summary for cards and previews.' })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    excerpt?: string;

    @ApiPropertyOptional({ example: 'Full post content.' })
    @IsOptional()
    @IsString()
    @MinLength(10)
    content?: string;

    @ApiPropertyOptional({ enum: PostType })
    @IsOptional()
    @IsEnum(PostType)
    type?: PostType;

    @ApiPropertyOptional({ enum: PostStatus })
    @IsOptional()
    @IsEnum(PostStatus)
    status?: PostStatus;

    @ApiPropertyOptional({ example: true })
    @IsOptional()
    @IsBoolean()
    isGlobal?: boolean;

    @ApiPropertyOptional({ example: 10 })
    @IsOptional()
    @IsInt()
    @Min(0)
    sortOrder?: number;

    @ApiPropertyOptional({ type: [PostTranslationDto] })
    @IsOptional()
    @IsArray()
    @HasUniqueLocales()
    @ValidateNested({ each: true })
    @Type(() => PostTranslationDto)
    translations?: PostTranslationDto[];
}
