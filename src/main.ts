import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('Tên API của bạn')
    .setDescription('Mô tả chi tiết về API')
    .setVersion('1.0')
    .addTag('users') // Thêm tag để phân nhóm các API
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  // Enable CORS
  app.enableCors({
    // origin: ['http://localhost:51733', 'http://localhost:5173'], // Flutter Web + Vite
    // methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    // credentials: true,
    origin: [
      'http://localhost:51733',        // React dev server         
      'https://smartbox-front-end.vercel.app' // sau này khi deploy frontend
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(3000);
  console.log('Backend running on http://localhost:3000');
}
bootstrap();
