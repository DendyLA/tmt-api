import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    UseGuards,
    Req,
    Patch,
} from '@nestjs/common';

import { VacanciesService } from './vacancies.service';
import { CreateVacancyDto } from './dto/create-vacancy.dto/create-vacancy.dto';
import { UpdateVacancyDto } from './dto/update-vacancy.dto/update-vacancy.dto';

import { VacancyOwnershipGuard } from '../auth/guards/ownership/vacancy-ownership.guard';
import { PermissionsGuard } from '../auth/guards/permissions/permissions.guard';
import { JwtAuthGuard } from '../auth/guards/jwt/jwt.guard';
import { Public } from '../auth/decorators/public.decorator';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('Vacancies')
@Controller('vacancies')
export class VacanciesController {
    constructor(private service: VacanciesService) {}

    // ================= PUBLIC =================
    @Public()
    @Get()
    findAll(@Req() req) {
        return this.service.findAll(req.user);
    }

    @Public()
    @Get(':id')
    findOne(@Param('id') id: string, @Req() req) {
        return this.service.findOne(id, req.user);
    }

    // ================= CREATE =================

    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Permissions('vacancy.create')
    @Post()
    create(@Req() req, @Body() dto: CreateVacancyDto) {
        return this.service.create(req.user.sub, dto, req);
    }

    // ================= UPDATE =================

    @UseGuards(JwtAuthGuard, PermissionsGuard, VacancyOwnershipGuard)
    @Permissions('vacancy.update')
    @Patch(':id')
    update(@Param('id') id: string, @Req() req, @Body() dto: UpdateVacancyDto) {
        return this.service.update(id, req.user, dto, req);
    }

    // ================= DELETE =================

    @UseGuards(JwtAuthGuard, PermissionsGuard, VacancyOwnershipGuard)
    @Permissions('vacancy.delete')
    @Delete(':id')
    remove(@Param('id') id: string, @Req() req) {
        return this.service.remove(id, req.user, req);
    }

    // ================= VERSIONING =================

    @UseGuards(JwtAuthGuard)
    @Get(':id/versions')
    getVersions(@Param('id') id: string) {
        return this.service.getVersions(id);
    }

    @UseGuards(JwtAuthGuard, PermissionsGuard, VacancyOwnershipGuard)
    @Permissions('vacancy.rollback')
    @Post(':id/rollback/:versionId')
    rollback(
        @Param('id') id: string,
        @Param('versionId') versionId: string,
        @Req() req,
    ) {
        return this.service.rollback(id, versionId, req.user, req);
    }

    // ================= RESTORE =================

    @UseGuards(JwtAuthGuard, PermissionsGuard, VacancyOwnershipGuard)
    @Permissions('vacancy.restore')
    @Post(':id/restore')
    restore(@Param('id') id: string, @Req() req) {
        return this.service.restore(id, req.user, req);
    }
}
