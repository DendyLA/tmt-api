import { IsString, IsOptional } from 'class-validator';

export class CreateVacancyDto {
    @IsString()
    title!: string;

    @IsString()
    description!: string;

    @IsString()
    requirements!: string;

    @IsString()
    location!: string;

    @IsOptional()
    @IsString()
    salary?: string;

    @IsString()
    contactEmail!: string;
}
