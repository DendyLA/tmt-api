import { Locale } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

function toNumber(value: unknown) {
    if (value === undefined || value === null || value === '') return undefined;
    return Number(value);
}

export class PaginationQueryDto {
    @Transform(({ value }) => toNumber(value))
    @IsOptional()
    @IsInt()
    @Min(1)
    page?: number = 1;

    @Transform(({ value }) => toNumber(value))
    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number = 20;

    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsString()
    tag?: string;

    @IsOptional()
    @IsString()
    locationKey?: string;

    @IsOptional()
    @IsEnum(Locale)
    locale?: Locale;
}

export function getPagination(query: PaginationQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    return {
        page,
        limit,
        skip: (page - 1) * limit,
        take: limit,
    };
}

export function paginatedResponse<T>(
    data: T[],
    total: number,
    page: number,
    limit: number,
) {
    return {
        data,
        meta: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
        },
    };
}
