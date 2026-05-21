import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateAdPlacementDto {
    @ApiProperty({ example: 'ad-id' })
    @IsString()
    adId!: string;

    @ApiProperty({ example: 'space-id' })
    @IsString()
    spaceId!: string;

    @ApiPropertyOptional({ example: 'company-id' })
    @IsOptional()
    @IsString()
    companyId?: string;

    @ApiPropertyOptional({ example: 10, default: 0 })
    @IsOptional()
    @IsInt()
    @Min(0)
    sortOrder?: number;
}
