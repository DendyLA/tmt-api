import { Body, Controller, Delete, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PERMISSIONS } from '../auth/constants/permissions.constants';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import { MediaService } from './media.service';

@ApiTags('Media')
@Controller()
export class MediaController {
    constructor(private readonly mediaService: MediaService) {}

    @Public()
    @ApiOperation({ summary: 'Get global + company media by company slug' })
    @Get('companies/:slug/media')
    findForCompanySite(@Param('slug') slug: string) {
        return this.mediaService.findForCompanySite(slug);
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create media metadata' })
    @Permissions(PERMISSIONS.MEDIA.CREATE)
    @Post('media')
    create(@Req() req: any, @Body() dto: CreateMediaDto) {
        return this.mediaService.create(req.user, dto, req);
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'List media for admin' })
    @Permissions(PERMISSIONS.MEDIA.MANAGE)
    @Get('media')
    findAllAdmin() {
        return this.mediaService.findAllAdmin();
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update media metadata' })
    @Permissions(PERMISSIONS.MEDIA.UPDATE)
    @Patch('media/:id')
    update(@Param('id') id: string, @Req() req: any, @Body() dto: UpdateMediaDto) {
        return this.mediaService.update(id, req.user, dto, req);
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Soft delete media' })
    @Permissions(PERMISSIONS.MEDIA.DELETE)
    @Delete('media/:id')
    remove(@Param('id') id: string, @Req() req: any) {
        return this.mediaService.remove(id, req.user, req);
    }
}
