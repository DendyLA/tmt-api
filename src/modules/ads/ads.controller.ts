import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PERMISSIONS } from '../auth/constants/permissions.constants';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { AdsService } from './ads.service';
import { CreateAdDto } from './dto/create-ad.dto';
import { CreateAdPlacementDto } from './dto/create-ad-placement.dto';
import { CreateAdSpaceDto } from './dto/create-ad-space.dto';
import { UpdateAdDto } from './dto/update-ad.dto';
import { UpdateAdSpaceDto } from './dto/update-ad-space.dto';

@ApiTags('Ads')
@Controller()
export class AdsController {
    constructor(private readonly adsService: AdsService) {}

    @Public()
    @ApiOperation({ summary: 'Get active ads for company site' })
    @Get('companies/:slug/ads')
    findForCompanySite(@Param('slug') slug: string, @Query('locationKey') locationKey?: string) {
        return this.adsService.findForCompanySite(slug, locationKey);
    }

    @ApiBearerAuth()
    @Permissions(PERMISSIONS.AD.CREATE)
    @Post('ad-spaces')
    createSpace(@Body() dto: CreateAdSpaceDto) {
        return this.adsService.createSpace(dto);
    }

    @ApiBearerAuth()
    @Permissions(PERMISSIONS.AD.UPDATE)
    @Patch('ad-spaces/:id')
    updateSpace(@Param('id') id: string, @Body() dto: UpdateAdSpaceDto) {
        return this.adsService.updateSpace(id, dto);
    }

    @ApiBearerAuth()
    @Permissions(PERMISSIONS.AD.DELETE)
    @Delete('ad-spaces/:id')
    removeSpace(@Param('id') id: string) {
        return this.adsService.removeSpace(id);
    }

    @ApiBearerAuth()
    @Permissions(PERMISSIONS.AD.CREATE)
    @Post('ads')
    createAd(@Body() dto: CreateAdDto) {
        return this.adsService.createAd(dto);
    }

    @ApiBearerAuth()
    @Permissions(PERMISSIONS.AD.UPDATE)
    @Patch('ads/:id')
    updateAd(@Param('id') id: string, @Body() dto: UpdateAdDto) {
        return this.adsService.updateAd(id, dto);
    }

    @ApiBearerAuth()
    @Permissions(PERMISSIONS.AD.DELETE)
    @Delete('ads/:id')
    removeAd(@Param('id') id: string) {
        return this.adsService.removeAd(id);
    }

    @ApiBearerAuth()
    @Permissions(PERMISSIONS.AD.MANAGE)
    @Post('ad-placements')
    createPlacement(@Body() dto: CreateAdPlacementDto) {
        return this.adsService.createPlacement(dto);
    }

    @Public()
    @Post('ad-placements/:id/impression')
    trackImpression(@Param('id') id: string) {
        return this.adsService.trackImpression(id);
    }

    @Public()
    @Post('ad-placements/:id/click')
    trackClick(@Param('id') id: string) {
        return this.adsService.trackClick(id);
    }
}
