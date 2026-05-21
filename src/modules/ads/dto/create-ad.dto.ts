import { AdType } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsEnum, IsInt, IsOptional, IsString, IsUrl, MaxLength, Min, MinLength } from 'class-validator';

export class CreateAdDto {
    @ApiPropertyOptional({ example: 'company-id' })
    @IsOptional()
    @IsString()
    companyId?: string;

    @ApiProperty({ example: 'Summer campaign' })
    @IsString()
    @MinLength(2)
    @MaxLength(160)
    title!: string;

    @ApiProperty({ enum: AdType })
    @IsEnum(AdType)
    type!: AdType;

    @ApiPropertyOptional({ example: 'https://cdn.tmt.tm/ads/banner.jpg' })
    @IsOptional()
    @IsUrl({ require_tld: false })
    @MaxLength(1000)
    imageUrl?: string;

    @ApiPropertyOptional({ example: 'https://company.tm' })
    @IsOptional()
    @IsUrl({ require_tld: false })
    @MaxLength(1000)
    targetUrl?: string;

    @ApiPropertyOptional({ example: '<div>Ad</div>' })
    @IsOptional()
    @IsString()
    embedCode?: string;

    @ApiPropertyOptional({ example: true, default: false })
    @IsOptional()
    @IsBoolean()
    isGlobal?: boolean;

    @ApiPropertyOptional({ example: true, default: true })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @ApiPropertyOptional({ example: 10, default: 0 })
    @IsOptional()
    @IsInt()
    @Min(0)
    sortOrder?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    startDate?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    endDate?: string;
}
