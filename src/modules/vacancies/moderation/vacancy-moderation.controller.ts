import { Controller, Patch, Param, UseGuards, Req } from '@nestjs/common';

import {
    ApiTags,
    ApiOperation,
    ApiBearerAuth,
    ApiParam,
} from '@nestjs/swagger';

import { VacancyModerationService } from './vacancy-moderation.service';
import { JwtAuthGuard } from '../../auth/guards/jwt/jwt.guard';
import { PermissionsGuard } from '../../auth/guards/permissions/permissions.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';

@ApiTags('Vacancy Moderation')
@ApiBearerAuth()
@Controller('admin/vacancies')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class VacancyModerationController {
    constructor(private service: VacancyModerationService) {}

    @ApiOperation({ summary: 'Approve vacancy' })
    @ApiParam({ name: 'id' })
    @Permissions('vacancy.approve')
    @Patch(':id/approve')
    approve(@Param('id') id: string, @Req() req: any) {
        return this.service.approve(id, req.user, req);
    }

    @ApiOperation({ summary: 'Reject vacancy' })
    @ApiParam({ name: 'id' })
    @Permissions('vacancy.reject')
    @Patch(':id/reject')
    reject(@Param('id') id: string, @Req() req: any) {
        return this.service.reject(id, req.user, req);
    }

    @ApiOperation({ summary: 'Archive vacancy' })
    @ApiParam({ name: 'id' })
    @Permissions('vacancy.archive')
    @Patch(':id/archive')
    archive(@Param('id') id: string, @Req() req) {
        return this.service.archive(id, req.user, req);
    }
}
