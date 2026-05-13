import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt/jwt.service';
import { DatabaseModule } from '../../database/database.module';
import { VacancyOwnershipGuard } from './guards/ownership/vacancy-ownership.guard';

@Module({
    imports: [
        DatabaseModule,
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                secret: config.get<string>('JWT_SECRET'),
                signOptions: { expiresIn: '7d' },
            }),
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy, VacancyOwnershipGuard],
    exports: [JwtStrategy, VacancyOwnershipGuard],
})
export class AuthModule {}
