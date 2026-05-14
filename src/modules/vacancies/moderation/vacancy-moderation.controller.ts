import { Controller, Patch, Param, UseGuards, Req } from '@nestjs/common';
import { VacancyModerationService } from './vacancy-moderation.service';
import { JwtAuthGuard } from '../../auth/guards/jwt/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('admin/vacancies')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VacancyModerationController {
    constructor(private service: VacancyModerationService) {}

    @Patch(':id/approve')
    @Roles('admin', 'superadmin')
    approve(@Param('id') id: string, @Req() req: any) {
        return this.service.approve(id, req.user, req);
    }

    @Patch(':id/reject')
    @Roles('admin', 'superadmin')
    reject(@Param('id') id: string, @Req() req: any) {
        return this.service.reject(id, req.user, req);
    }

    @Patch(':id/archive')
    @Roles('admin', 'superadmin')
    archive(@Param('id') id: string) {
        return this.service.archive(id);
    }
}
