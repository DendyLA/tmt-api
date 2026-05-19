import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthenticatedUser } from '../../types/authenticated-user.type';

type JwtPayload = {
    sub: string;
    email: string;
    role?: string | null;
    permissions?: string[];
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: configService.get<string>('JWT_SECRET')!,
        });
    }

    async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
        return {
            sub: payload.sub,
            email: payload.email,
            role: payload.role ?? null,
            permissions: Array.isArray(payload.permissions)
                ? payload.permissions
                : [],
        };
    }
}
