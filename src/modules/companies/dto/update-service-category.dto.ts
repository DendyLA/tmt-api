import { ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsInt,
    IsOptional,
    IsString,
    Matches,
    MaxLength,
    Min,
    MinLength,
} from 'class-validator';

export class UpdateServiceCategoryDto {
    @ApiPropertyOptional({ example: 'Digital Products' })
    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(120)
    name?: string;

    @ApiPropertyOptional({ example: 'digital-products' })
    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(80)
    @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    slug?: string;

    @ApiPropertyOptional({ example: 'Websites, platforms and internal tools.' })
    @IsOptional()
    @IsString()
    @MaxLength(2000)
    description?: string;

    @ApiPropertyOptional({ example: 10 })
    @IsOptional()
    @IsInt()
    @Min(0)
    sortOrder?: number;
}
