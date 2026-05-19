import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVacancyDto {
    @ApiProperty({ example: 'Senior Backend Developer' })
    @IsString()
    title!: string;

    @ApiProperty({
        example: 'Разрабатываем платформу для компаний Туркменистана...',
    })
    @IsString()
    description!: string;

    @ApiProperty({ example: 'Опыт от 3 лет, знание NestJS, PostgreSQL' })
    @IsString()
    requirements!: string;

    @ApiProperty({ example: 'Ашхабад' })
    @IsString()
    location!: string;

    @ApiPropertyOptional({ example: '1000-2000 USD' })
    @IsOptional()
    @IsString()
    salary?: string;

    @ApiProperty({ example: 'hr@company.tm' })
    @IsString()
    contactEmail!: string;
}
