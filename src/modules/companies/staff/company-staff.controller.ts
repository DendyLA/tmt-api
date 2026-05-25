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
import { Public } from '../../auth/decorators/public.decorator';
import { CompanyAccessGuard } from '../../auth/guards/company-access/company-access.guard';
import { CompanyStaffService } from './company-staff.service';
import { AcceptCompanyStaffInviteDto } from './dto/accept-company-staff-invite.dto';
import { CreateCompanyStaffInviteDto } from './dto/create-company-staff-invite.dto';
import { InviteCompanyStaffDto } from './dto/invite-company-staff.dto';
import { UpdateCompanyStaffDto } from './dto/update-company-staff.dto';

@ApiBearerAuth()
@ApiTags('Company Staff')
@Controller()
export class CompanyStaffController {
    constructor(private readonly staffService: CompanyStaffService) {}

    @ApiOperation({ summary: 'List company staff' })
    @UseGuards(CompanyAccessGuard)
    @CompanyPermission(PERMISSIONS.COMPANY.STAFF_MANAGE)
    @Get('companies/:companyId/staff')
    findByCompany(@Param('companyId') companyId: string) {
        return this.staffService.findByCompany(companyId);
    }

    @ApiOperation({ summary: 'Add existing user to company staff' })
    @UseGuards(CompanyAccessGuard)
    @CompanyPermission(PERMISSIONS.COMPANY.STAFF_MANAGE)
    @Post('companies/:companyId/staff')
    invite(
        @Param('companyId') companyId: string,
        @Req() req: any,
        @Body() dto: InviteCompanyStaffDto,
    ) {
        return this.staffService.invite(companyId, req.user, dto, req);
    }

    @ApiOperation({ summary: 'Create company staff invite' })
    @UseGuards(CompanyAccessGuard)
    @CompanyPermission(PERMISSIONS.COMPANY.STAFF_MANAGE)
    @Post('companies/:companyId/staff/invite')
    createInvite(
        @Param('companyId') companyId: string,
        @Req() req: any,
        @Body() dto: CreateCompanyStaffInviteDto,
    ) {
        return this.staffService.createInvite(companyId, req.user, dto, req);
    }

    @Public()
    @ApiOperation({ summary: 'Preview company staff invite' })
    @Get('companies/staff/invites/:token')
    previewInvite(@Param('token') token: string) {
        return this.staffService.previewInvite(token);
    }

    @Public()
    @ApiOperation({ summary: 'Accept company staff invite' })
    @Post('companies/staff/invites/accept')
    acceptInvite(@Req() req: any, @Body() dto: AcceptCompanyStaffInviteDto) {
        return this.staffService.acceptInvite(req.user, dto, req);
    }

    @ApiOperation({ summary: 'Revoke company staff invite' })
    @UseGuards(CompanyAccessGuard)
    @CompanyPermission(PERMISSIONS.COMPANY.STAFF_MANAGE)
    @Delete('companies/:companyId/staff/invites/:id')
    revokeInvite(
        @Param('companyId') companyId: string,
        @Param('id') id: string,
        @Req() req: any,
    ) {
        return this.staffService.revokeInvite(companyId, id, req.user, req);
    }

    @ApiOperation({ summary: 'Update company staff member' })
    @UseGuards(CompanyAccessGuard)
    @CompanyPermission(PERMISSIONS.COMPANY.STAFF_MANAGE)
    @Patch('company-staff/:memberId')
    update(
        @Param('memberId') memberId: string,
        @Req() req: any,
        @Body() dto: UpdateCompanyStaffDto,
    ) {
        return this.staffService.update(memberId, req.user, dto, req);
    }

    @ApiOperation({ summary: 'Remove company staff member' })
    @UseGuards(CompanyAccessGuard)
    @CompanyPermission(PERMISSIONS.COMPANY.STAFF_MANAGE)
    @Delete('company-staff/:memberId')
    remove(@Param('memberId') memberId: string, @Req() req: any) {
        return this.staffService.remove(memberId, req.user, req);
    }
}
