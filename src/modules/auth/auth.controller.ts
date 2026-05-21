import { Body, Controller, Post } from '@nestjs/common';
import { Public } from './decorators/public.decorator';
import { AuthService } from './auth.service';

//dto
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Controller('auth')
export class AuthController {
    constructor(private auth: AuthService) {}

    @Public()
    @Post('register')
    register(@Body() dto: RegisterDto) {
        return this.auth.register(dto);
    }

    @Public()
    @Post('login')
    login(@Body() dto: LoginDto) {
        return this.auth.login(dto);
    }

    @Public()
    @Post('refresh')
    refresh(@Body() dto: RefreshTokenDto) {
        return this.auth.refresh(dto.refreshToken);
    }

    @Public()
    @Post('logout')
    logout(@Body() dto: RefreshTokenDto) {
        return this.auth.logout(dto.refreshToken);
    }
}
