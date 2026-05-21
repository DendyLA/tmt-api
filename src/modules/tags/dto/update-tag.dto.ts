import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class UpdateTagDto {
    @ApiPropertyOptional({ example: 'Technology' })
    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(80)
    name?: string;

    @ApiPropertyOptional({ example: 'technology' })
    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(80)
    @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    slug?: string;
}
