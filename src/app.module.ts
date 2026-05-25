import { Module, MiddlewareConsumer } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { DatabaseModule } from './database/database.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';

import { JwtAuthGuard } from './modules/auth/guards/jwt/jwt.guard';
import { PermissionsGuard } from './modules/auth/guards/permissions/permissions.guard';

import { VacanciesModule } from './modules/vacancies/vacancies.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { PostsModule } from './modules/posts/posts.module';
import { MediaModule } from './modules/media/media.module';
import { TagsModule } from './modules/tags/tags.module';
import { ContentVersionsModule } from './modules/content-versions/content-versions.module';
import { SiteModule } from './modules/site/site.module';
import { AdsModule } from './modules/ads/ads.module';
import { AdminModule } from './modules/admin/admin.module';
import { AuditLogModule } from './modules/audit-log/audit-log.module';
import { MaintenanceModule } from './modules/maintenance/maintenance.module';
import { MailModule } from './modules/mail/mail.module';
import { AuditLogMiddleware } from './common/middleware/audit-log/audit-log.middleware';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
    imports: [
        DatabaseModule,
        UsersModule,
        AuthModule,
        ConfigModule.forRoot({ isGlobal: true }),
        ScheduleModule.forRoot(),
        ThrottlerModule.forRoot([
            {
                ttl: 60_000,
                limit: 120,
            },
        ]),
        VacanciesModule,
        CompaniesModule,
        PostsModule,
        MediaModule,
        TagsModule,
        ContentVersionsModule,
        SiteModule,
        AdsModule,
        AdminModule,
        AuditLogModule,
        MaintenanceModule,
        MailModule,
        EventEmitterModule.forRoot(),
    ],
    controllers: [AppController],
    providers: [
        AppService,

        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
        {
            provide: APP_GUARD,
            useClass: JwtAuthGuard,
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
