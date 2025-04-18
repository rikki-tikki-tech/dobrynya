import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import * as cors from 'cors';
import { GrpcToHttpErrorsInterceptor } from '@/interceptors/GrpcToHttpErrorsInterceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new GrpcToHttpErrorsInterceptor());
  app.use(cookieParser());
  app.setGlobalPrefix('api');
  app.use(
    cors({
      origin: ['http://localhost:3001', 'http://localhost:3000', 'http://local.yenisei.org:3000', 'https://yenisei.org'], // Укажите ваш origin
      credentials: true, // Разрешение на отправку cookies
    }),
  );

  await app.listen(3000);
}

bootstrap();
