import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpsertCompanyContactDto {
    @ApiPropertyOptional({ example: 'info@company.tm' })
    @IsOptional()
    @IsEmail()
    @MaxLength(255)
    email?: string;

    @ApiPropertyOptional({ example: '+993 12 345678' })
    @IsOptional()
    @IsString()
    @MaxLength(80)
    phone?: string;

    @ApiPropertyOptional({ example: 'Ashgabat, Turkmenistan' })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    address?: string;

    @ApiPropertyOptional({ example: 'Ashgabat' })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    location?: string;
}
