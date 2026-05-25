import { Locale } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class LocaleQueryDto {
    @IsOptional()
    @IsEnum(Locale)
    locale?: Locale;

    @IsOptional()
    @IsString()
    domain?: string;

    @IsOptional()
    @IsString()
    locationKey?: string;
}

export const DEFAULT_LOCALE = Locale.RU;
export const FALLBACK_LOCALES = [Locale.RU, Locale.EN, Locale.TK] as const;
