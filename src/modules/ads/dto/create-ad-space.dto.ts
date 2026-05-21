import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Matches, MaxLength, Min, MinLength } from 'class-validator';

export class CreateAdSpaceDto {
    @ApiPropertyOptional({ example: 'company-id' })
    @IsOptional()
    @IsString()
    companyId?: string;

    @ApiProperty({ example: 'Homepage Hero' })
    @IsString()
    @MinLength(2)
    @MaxLength(120)
    name!: string;

    @ApiPropertyOptional({ example: 'Hero banner on homepage.' })
    @IsOptional()
    @IsString()
    @MaxLength(1000)
    description?: string;

    @ApiProperty({ example: 'home.hero' })
    @IsString()
    @MaxLength(120)
    @Matches(/^[a-z0-9]+(?:[.-][a-z0-9]+)*$/)
    locationKey!: string;

    @ApiPropertyOptional({ example: 10, default: 0 })
    @IsOptional()
    @IsInt()
    @Min(0)
    sortOrder?: number;
}
