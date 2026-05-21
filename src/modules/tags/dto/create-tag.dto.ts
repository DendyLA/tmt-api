import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class CreateTagDto {
    @ApiProperty({ example: 'Technology' })
    @IsString()
    @MinLength(2)
    @MaxLength(80)
    name!: string;

    @ApiProperty({ example: 'technology' })
    @IsString()
    @MinLength(2)
    @MaxLength(80)
    @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    slug!: string;
}
