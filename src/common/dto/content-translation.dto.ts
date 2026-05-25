import { Locale } from '@prisma/client';
import { Type } from 'class-transformer';
import {
    IsArray,
    IsEnum,
    IsOptional,
    IsString,
    MaxLength,
    MinLength,
    ValidateNested,
} from 'class-validator';

export class CompanyTranslationDto {
    @IsEnum(Locale)
    locale!: Locale;

    @IsString()
    @MinLength(2)
    @MaxLength(180)
    name!: string;

    @IsOptional()
    @IsString()
    @MaxLength(5000)
    description?: string;
}

export class TitleDescriptionTranslationDto {
    @IsEnum(Locale)
    locale!: Locale;

    @IsString()
    @MinLength(2)
    @MaxLength(180)
    title!: string;

    @IsString()
    @MinLength(10)
    @MaxLength(10000)
    description!: string;
}

export class NameDescriptionTranslationDto {
    @IsEnum(Locale)
    locale!: Locale;

    @IsString()
    @MinLength(2)
    @MaxLength(180)
    name!: string;

    @IsOptional()
    @IsString()
    @MaxLength(5000)
    description?: string;
}

export class PostTranslationDto {
    @IsEnum(Locale)
    locale!: Locale;

    @IsString()
    @MinLength(2)
    @MaxLength(180)
    title!: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    excerpt?: string;

    @IsString()
    @MinLength(10)
    @MaxLength(50000)
    content!: string;
}

export class AdTranslationDto {
    @IsEnum(Locale)
    locale!: Locale;

    @IsString()
    @MinLength(2)
    @MaxLength(160)
    title!: string;
}

export function ValidateTranslations() {
    return function (target: object, propertyKey: string) {
        IsOptional()(target, propertyKey);
        IsArray()(target, propertyKey);
        ValidateNested({ each: true })(target, propertyKey);
        Type(() => Object)(target, propertyKey);
    };
}
