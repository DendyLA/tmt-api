import { Controller, Patch, Param, UseGuards, Req } from '@nestjs/common';
import { VacancyModerationService } from './vacancy-moderation.service';
import { JwtAuthGuard } from '../../auth/guards/jwt/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('vacancies/moderation')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ModerationController {
    constructor(private moderation: VacancyModerationService) {}

    @Roles('admin', 'superadmin')
    @Patch(':id/approve')
    approve(@Param('id') id: string, @Req() req) {
        return this.moderation.approve(id, req.user, req);
    }

    @Roles('admin', 'superadmin')
    @Patch(':id/reject')
    reject(@Param('id') id: string, @Req() req) {
        return this.moderation.reject(id, req.user, req);
    }
}
