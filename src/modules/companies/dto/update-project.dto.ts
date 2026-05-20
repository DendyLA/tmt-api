import { ProjectStatus } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateProjectDto {
    @ApiPropertyOptional({ example: 'Corporate Website Redesign' })
    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(180)
    title?: string;

    @ApiPropertyOptional({ example: 'Project description and business value.' })
    @IsOptional()
    @IsString()
    @MinLength(10)
    @MaxLength(10000)
    description?: string;

    @ApiPropertyOptional({ enum: ProjectStatus })
    @IsOptional()
    @IsEnum(ProjectStatus)
    status?: ProjectStatus;
}
