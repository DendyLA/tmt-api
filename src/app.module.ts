import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { DatabaseModule } from './database/database.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';

import { JwtAuthGuard } from './modules/auth/guards/jwt/jwt.guard';
import { RolesGuard } from './modules/auth/guards/roles/roles.guard';
import { VacanciesModule } from './modules/vacancies/vacancies.module';
import { VacanciesService } from './modules/vacancies/vacancies.service';
import { VacanciesController } from './modules/vacancies/vacancies.controller';

@Module({
    imports: [
        DatabaseModule,
        UsersModule,
        AuthModule,
        ConfigModule.forRoot({ isGlobal: true }),
        VacanciesModule,
    ],
    controllers: [AppController, VacanciesController],
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
        VacanciesService,
    ],
})
export class AppModule {}
