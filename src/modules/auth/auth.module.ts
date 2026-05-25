import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt/jwt.service';
import { DatabaseModule } from '../../database/database.module';
import { VacancyOwnershipGuard } from './guards/ownership/vacancy-ownership.guard';
import { PermissionsGuard } from './guards/permissions/permissions.guard';
import { CompanyAccessGuard } from './guards/company-access/company-access.guard';
import { PermissionResolverService } from './services/permission-resolver.service';

@Module({
    imports: [
        DatabaseModule,
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                secret: config.get<string>('JWT_SECRET'),
                signOptions: {
                    expiresIn: (config.get<string>('JWT_ACCESS_EXPIRES_IN') ??
                        '15m') as any,
                },
            }),
        }),
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        JwtStrategy,
        VacancyOwnershipGuard,
        PermissionsGuard,
        CompanyAccessGuard,
        PermissionResolverService,
    ],
    exports: [
        AuthService,
        JwtStrategy,
        VacancyOwnershipGuard,
        PermissionsGuard,
        CompanyAccessGuard,
        PermissionResolverService,
    ],
})
export class AuthModule {}
