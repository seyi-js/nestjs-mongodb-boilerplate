import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { TransformResponseInterceptor } from './interceptors/response.interceptor';
import { appRequestLogger } from './middleware/logger';
import { AllExceptionsFilter } from './interceptors/exception.interceptor';

async function bootstrap() {
  const logger = new Logger('bootstrap');

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.set('trust proxy', 1);

  app.use(helmet());

  app.useGlobalFilters(new AllExceptionsFilter(app.get(HttpAdapterHost)));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      stopAtFirstError: false,
      forbidNonWhitelisted: true,
      transform: true,
      validationError: {
        target: true,
        value: true,
      },
    }),
  );

  app.use(appRequestLogger);

  app.setGlobalPrefix('api/v1');

  app.enableCors();

  app.useGlobalInterceptors(new TransformResponseInterceptor());

  const configService = app.get<ConfigService>(ConfigService);

  const port = configService.get<number>('app.port');

  await app.listen(port, () => {
    logger.log(`Application listening on port ${port}`);
  });
}
bootstrap();
