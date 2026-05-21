import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CompanyPermission } from '../../auth/decorators/company-permission.decorator';
import { PERMISSIONS } from '../../auth/constants/permissions.constants';
import { CompanyAccessGuard } from '../../auth/guards/company-access/company-access.guard';
import { CompanyStaffService } from './company-staff.service';
import { InviteCompanyStaffDto } from './dto/invite-company-staff.dto';
import { UpdateCompanyStaffDto } from './dto/update-company-staff.dto';

@ApiBearerAuth()
@ApiTags('Company Staff')
@Controller()
@UseGuards(CompanyAccessGuard)
@CompanyPermission(PERMISSIONS.COMPANY.STAFF_MANAGE)
export class CompanyStaffController {
    constructor(private readonly staffService: CompanyStaffService) {}

    @ApiOperation({ summary: 'List company staff' })
    @Get('companies/:companyId/staff')
    findByCompany(@Param('companyId') companyId: string) {
        return this.staffService.findByCompany(companyId);
    }

    @ApiOperation({ summary: 'Add existing user to company staff' })
    @Post('companies/:companyId/staff')
    invite(
        @Param('companyId') companyId: string,
        @Req() req: any,
        @Body() dto: InviteCompanyStaffDto,
    ) {
        return this.staffService.invite(companyId, req.user, dto, req);
    }

    @ApiOperation({ summary: 'Update company staff member' })
    @Patch('company-staff/:memberId')
    update(
        @Param('memberId') memberId: string,
        @Req() req: any,
        @Body() dto: UpdateCompanyStaffDto,
    ) {
        return this.staffService.update(memberId, req.user, dto, req);
    }

    @ApiOperation({ summary: 'Remove company staff member' })
    @Delete('company-staff/:memberId')
    remove(@Param('memberId') memberId: string, @Req() req: any) {
        return this.staffService.remove(memberId, req.user, req);
    }
}
