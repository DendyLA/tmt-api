import { ProjectStatus } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsArray,
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
    MaxLength,
    Min,
    MinLength,
    ValidateNested,
} from 'class-validator';
import { TitleDescriptionTranslationDto } from '../../../../common/dto/content-translation.dto';
import { HasUniqueLocales } from '../../../../common/validators/unique-locales.validator';

export class CreateProjectDto {
    @ApiProperty({ example: 'Corporate Website Redesign' })
    @IsString()
    @MinLength(2)
    @MaxLength(180)
    title!: string;

    @ApiProperty({ example: 'Project description and business value.' })
    @IsString()
    @MinLength(10)
    @MaxLength(10000)
    description!: string;

    @ApiPropertyOptional({ enum: ProjectStatus, default: ProjectStatus.DRAFT })
    @IsOptional()
    @IsEnum(ProjectStatus)
    status?: ProjectStatus;

    @ApiPropertyOptional({ example: 10, default: 0 })
    @IsOptional()
    @IsInt()
    @Min(0)
    sortOrder?: number;

    @ApiPropertyOptional({ type: [TitleDescriptionTranslationDto] })
    @IsOptional()
    @IsArray()
    @HasUniqueLocales()
    @ValidateNested({ each: true })
    @Type(() => TitleDescriptionTranslationDto)
    translations?: TitleDescriptionTranslationDto[];
}
