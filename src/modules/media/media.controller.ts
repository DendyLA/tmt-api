import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    Req,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { PERMISSIONS } from '../auth/constants/permissions.constants';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import { UploadMediaDto } from './dto/upload-media.dto';
import { MediaService } from './media.service';

@ApiTags('Media')
@Controller()
export class MediaController {
    constructor(private readonly mediaService: MediaService) {}

    @Public()
    @ApiOperation({ summary: 'Get global + company media by company slug' })
    @Get('companies/:slug/media')
    findForCompanySite(
        @Param('slug') slug: string,
        @Query('tag') tagSlug?: string,
        @Query() query?: PaginationQueryDto,
    ) {
        return this.mediaService.findForCompanySite(slug, tagSlug, query);
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create media metadata' })
    @Permissions(PERMISSIONS.MEDIA.CREATE)
    @Post('media')
    create(@Req() req: any, @Body() dto: CreateMediaDto) {
        return this.mediaService.create(req.user, dto, req);
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Upload media file and create metadata' })
    @Permissions(PERMISSIONS.MEDIA.CREATE)
    @Post('media/upload')
    @UseInterceptors(
        FileInterceptor('file', {
            limits: { fileSize: 20 * 1024 * 1024 },
            fileFilter: (_req, file, callback) => {
                const allowedMimeTypes = [
                    'image/jpeg',
                    'image/png',
                    'image/webp',
                    'image/gif',
                    'video/mp4',
                    'application/pdf',
                ];

                if (!allowedMimeTypes.includes(file.mimetype)) {
                    return callback(
                        new BadRequestException('Unsupported media type'),
                        false,
                    );
                }

                callback(null, true);
            },
        }),
    )
    upload(
        @Req() req: any,
        @UploadedFile() file: any,
        @Body() dto: UploadMediaDto,
    ) {
        return this.mediaService.upload(req.user, file, dto, req);
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'List media for admin' })
    @Permissions(PERMISSIONS.MEDIA.MANAGE)
    @Get('media')
    findAllAdmin(@Query() query: PaginationQueryDto) {
        return this.mediaService.findAllAdmin(query);
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
