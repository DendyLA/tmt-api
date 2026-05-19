import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

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
	app.enableCors();
	
    await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
