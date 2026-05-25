import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsArray,
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

export class CreateCompanyServiceDto {
    @ApiPropertyOptional({ example: 'category-id' })
    @IsOptional()
    @IsString()
    categoryId?: string;

    @ApiProperty({ example: 'Backend Platform Development' })
    @IsString()
    @MinLength(2)
    @MaxLength(180)
    title!: string;

    @ApiProperty({
        example: 'Production-ready backend systems for company websites.',
    })
    @IsString()
    @MinLength(10)
    @MaxLength(10000)
    description!: string;

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
