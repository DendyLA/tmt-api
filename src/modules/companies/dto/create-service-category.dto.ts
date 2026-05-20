import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsInt,
    IsOptional,
    IsString,
    Matches,
    MaxLength,
    Min,
    MinLength,
} from 'class-validator';

export class CreateServiceCategoryDto {
    @ApiProperty({ example: 'Digital Products' })
    @IsString()
    @MinLength(2)
    @MaxLength(120)
    name!: string;

    @ApiProperty({ example: 'digital-products' })
    @IsString()
    @MinLength(2)
    @MaxLength(80)
    @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    slug!: string;

    @ApiPropertyOptional({ example: 'Websites, platforms and internal tools.' })
    @IsOptional()
    @IsString()
    @MaxLength(2000)
    description?: string;

    @ApiPropertyOptional({ example: 10, default: 0 })
    @IsOptional()
    @IsInt()
    @Min(0)
    sortOrder?: number;
}
