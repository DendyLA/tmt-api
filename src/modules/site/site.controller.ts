import { Controller, Get, Headers, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { LocaleQueryDto } from '../../common/dto/locale-query.dto';
import { Public } from '../auth/decorators/public.decorator';
import { SiteService } from './site.service';

@ApiTags('Site')
@Controller('site')
export class SiteController {
    constructor(private readonly siteService: SiteService) {}

    @Public()
    @ApiOperation({ summary: 'Resolve active company site by domain or Host header' })
    @Get('resolve/domain')
    resolveByDomain(
        @Query('domain') domain?: string,
        @Headers('host') host?: string,
    ) {
        return this.siteService.resolveByDomain(domain ?? host);
    }

    @Public()
    @ApiOperation({ summary: 'Get homepage payload by domain or Host header' })
    @Get('by-domain/home')
    getHomeByDomain(
        @Query('domain') domain?: string,
        @Headers('host') host?: string,
        @Query() query?: LocaleQueryDto,
    ) {
        return this.siteService.getHomeByDomain(domain ?? host, query?.locale);
    }

    @Public()
    @ApiOperation({ summary: 'Get aggregate homepage payload by company slug' })
    @Get(':companySlug/home')
    getHome(
        @Param('companySlug') companySlug: string,
        @Query() query: LocaleQueryDto,
    ) {
        return this.siteService.getHome(companySlug, query.locale);
    }
}
