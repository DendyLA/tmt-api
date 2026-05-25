import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import helmet from 'helmet';
import { json, urlencoded } from 'express';
import { envFlag, validateEnvironment } from './config/env.validation';

async function bootstrap() {
    validateEnvironment();

    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    app.set('trust proxy', envFlag(process.env.TRUST_PROXY));

    if (envFlag(process.env.ENABLE_SWAGGER, process.env.NODE_ENV !== 'production')) {
        const config = new DocumentBuilder()
            .setTitle('TMT API')
            .setDescription(
                'TMT.TM backend API for companies, vacancies, posts, media, ads, moderation, and JWT authentication.',
            )
            .setVersion('1.0')
            .addBearerAuth()
            .build();

        const document = SwaggerModule.createDocument(app, config);
        SwaggerModule.setup('api/docs', app, document);
    }

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );
    app.use(helmet());
    app.use(json({ limit: process.env.REQUEST_BODY_LIMIT ?? '1mb' }));
    app.use(
        urlencoded({
            extended: true,
            limit: process.env.REQUEST_BODY_LIMIT ?? '1mb',
        }),
    );
    app.enableCors({
        origin: resolveCorsOrigins(),
        credentials: true,
    });
    app.useStaticAssets(join(process.cwd(), 'public', 'uploads'), {
        prefix: '/uploads',
    });

    await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

function resolveCorsOrigins() {
    const origins = process.env.CORS_ORIGINS;
    if (!origins) return process.env.NODE_ENV === 'production' ? false : true;

    return origins
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean);
}
