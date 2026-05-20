import { ProjectStatus } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateProjectDto {
    @ApiProperty({ example: 'Corporate Website Redesign' })
    @IsString()
    @MinLength(2)
    @MaxLength(180)
    title!: string;

    @ApiProperty({ example: 'Project description and business value.' })
    @IsString()
    @MinLength(10)
    @MaxLength(10000)
    description!: string;

    @ApiPropertyOptional({ enum: ProjectStatus, default: ProjectStatus.DRAFT })
    @IsOptional()
    @IsEnum(ProjectStatus)
    status?: ProjectStatus;
}
