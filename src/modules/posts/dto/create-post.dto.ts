import { PostStatus, PostType } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsBoolean,
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
    Matches,
    MaxLength,
    Min,
    MinLength,
} from 'class-validator';

export class CreatePostDto {
    @ApiPropertyOptional({ example: 'company-id' })
    @IsOptional()
    @IsString()
    companyId?: string;

    @ApiProperty({ example: 'Group launches new digital platform' })
    @IsString()
    @MinLength(2)
    @MaxLength(180)
    title!: string;

    @ApiProperty({ example: 'group-launches-new-digital-platform' })
    @IsString()
    @MinLength(2)
    @MaxLength(120)
    @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    slug!: string;

    @ApiPropertyOptional({ example: 'Short summary for cards and previews.' })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    excerpt?: string;

    @ApiProperty({ example: 'Full post content.' })
    @IsString()
    @MinLength(10)
    content!: string;

    @ApiPropertyOptional({ enum: PostType, default: PostType.NEWS })
    @IsOptional()
    @IsEnum(PostType)
    type?: PostType;

    @ApiPropertyOptional({ enum: PostStatus, default: PostStatus.DRAFT })
    @IsOptional()
    @IsEnum(PostStatus)
    status?: PostStatus;

    @ApiPropertyOptional({ example: true, default: false })
    @IsOptional()
    @IsBoolean()
    isGlobal?: boolean;

    @ApiPropertyOptional({ example: 10, default: 0 })
    @IsOptional()
    @IsInt()
    @Min(0)
    sortOrder?: number;
}
