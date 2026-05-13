import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    UseGuards,
    Req,
} from '@nestjs/common';
import { VacanciesService } from './vacancies.service';
import { CreateVacancyDto } from './dto/create-vacancy.dto';
import { JwtOptionalGuard } from '../auth/guards/optional/jwt-optional.guard';
import { VacancyOwnershipGuard } from '../auth/guards/ownership/vacancy-ownership.guard';
import { JwtAuthGuard } from '../auth/guards/jwt/jwt.guard';

@Controller('vacancies')
export class VacanciesController {
    constructor(private service: VacanciesService) {}

    @UseGuards(JwtOptionalGuard)
    @Get()
    findAll(@Req() req) {
        return this.service.findAll(req.user);
    }

    @UseGuards(JwtOptionalGuard)
    @Get(':id')
    findOne(@Param('id') id: string, @Req() req) {
        return this.service.findOne(id, req.user);
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    create(@Req() req, @Body() dto: CreateVacancyDto) {
        return this.service.create(req.user.sub, dto);
    }

    @UseGuards(JwtAuthGuard, VacancyOwnershipGuard)
    @Delete(':id')
    remove(@Param('id') id: string, @Req() req) {
        return this.service.remove(id, req.user);
    }
}
