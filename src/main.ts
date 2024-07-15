import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import * as cors from 'cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.use(
    cors({
      origin: 'http://localhost:3001', // Укажите ваш origin
      credentials: true, // Разрешение на отправку cookies
    }),
  );

  await app.listen(3000);
}

bootstrap();
