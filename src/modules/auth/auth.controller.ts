import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Query,
    Req,
} from '@nestjs/common';
import { Public } from './decorators/public.decorator';
import { AuthService } from './auth.service';

//dto
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';

@Controller('auth')
export class AuthController {
    constructor(private auth: AuthService) {}

    @Public()
    @Post('register')
    register(@Body() dto: RegisterDto, @Req() req: any) {
        return this.auth.register(dto, req);
    }

    @Public()
    @Post('login')
    login(@Body() dto: LoginDto, @Req() req: any) {
        return this.auth.login(dto, req);
    }

    @Public()
    @Post('refresh')
    refresh(@Body() dto: RefreshTokenDto, @Req() req: any) {
        return this.auth.refresh(dto.refreshToken, req);
    }

    @Public()
    @Post('logout')
    logout(@Body() dto: RefreshTokenDto) {
        return this.auth.logout(dto.refreshToken);
    }

    @Public()
    @Post('verify-email')
    verifyEmail(@Body() dto: VerifyEmailDto) {
        return this.auth.verifyEmail(dto.token);
    }

    @Public()
    @Get('verify-email')
    verifyEmailByLink(@Query('token') token: string) {
        return this.auth.verifyEmail(token);
    }

    @Post('resend-verification')
    resendVerification(@Req() req: any) {
        return this.auth.resendEmailVerification(req.user.sub, req);
    }

    @Get('sessions')
    getSessions(@Req() req: any) {
        return this.auth.getSessions(req.user.sub);
    }

    @Delete('sessions/:id')
    revokeSession(@Req() req: any, @Param('id') id: string) {
        return this.auth.revokeSession(req.user.sub, id);
    }

    @Post('logout-all')
    logoutAll(@Req() req: any) {
        return this.auth.logoutAll(req.user.sub);
    }
}
