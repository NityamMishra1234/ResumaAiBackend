import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

// cors for the development 
// "http://localhost:9002",
//   "http://192.168.1.145:9002",
//   "http://localhost:5173/",
//   "http://localhost:5173"

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      "https://resuma-ai-enterprise.vercel.app",
      "https://resuma-builder-lime.vercel.app"
    ],
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true
    }),
  );
  await app.listen(process.env.PORT ?? 3000);

}
bootstrap();
