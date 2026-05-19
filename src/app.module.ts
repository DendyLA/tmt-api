import { Module, MiddlewareConsumer } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { DatabaseModule } from './database/database.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';

import { JwtAuthGuard } from './modules/auth/guards/jwt/jwt.guard';
import { RolesGuard } from './modules/auth/guards/roles/roles.guard';
import { PermissionsGuard } from './modules/auth/guards/permissions/permissions.guard';

import { VacanciesModule } from './modules/vacancies/vacancies.module';
import { AuditLogModule } from './modules/audit-log/audit-log.module';
import { AuditLogMiddleware } from './common/middleware/audit-log/audit-log.middleware';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
    imports: [
        DatabaseModule,
        UsersModule,
        AuthModule,
        ConfigModule.forRoot({ isGlobal: true }),
        VacanciesModule,
        AuditLogModule,
        EventEmitterModule.forRoot(),
    ],
    controllers: [AppController],
    providers: [
        AppService,

        {
            provide: APP_GUARD,
            useClass: JwtAuthGuard,
        },
        {
            provide: APP_GUARD,
            useClass: RolesGuard,
        },
        {
            provide: APP_GUARD,
            useClass: PermissionsGuard,
        },
    ],
})
export class AppModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(AuditLogMiddleware).forRoutes('*');
    }
}
