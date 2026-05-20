import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsInt,
    IsOptional,
    IsString,
    MaxLength,
    Min,
    MinLength,
} from 'class-validator';

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
}
