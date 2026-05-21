import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import helmet from 'helmet';
import { json, urlencoded } from 'express';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    const config = new DocumentBuilder()
        .setTitle('TMT API')
        .setDescription(
            `
			TMT.TM — платформа для компаний.
			
			Включает управление компаниями, вакансиями, услугами, проектами, 
			постами, медиа, рекламными блоками и партнёрами.
			
			Аутентификация: Bearer JWT.
		`,
        )
        .setVersion('1.0')
        .addBearerAuth()
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );
    app.use(helmet());
    app.use(json({ limit: process.env.REQUEST_BODY_LIMIT ?? '1mb' }));
    app.use(urlencoded({ extended: true, limit: process.env.REQUEST_BODY_LIMIT ?? '1mb' }));
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
    if (!origins) return true;

    return origins
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean);
}
