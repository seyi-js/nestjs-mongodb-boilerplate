import {
  CacheModule,
  MiddlewareConsumer,
  Module,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import * as Sentry from '@sentry/node';
import '@sentry/tracing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import appConfig from './config/app.config';
import { IAppConfig } from './config/config.interface';
import dbConfig from './config/db.config';
import { AllExceptionsFilter } from './interceptors/exception.interceptor';
import { ThrottlerBehindProxyGuard } from './middleware/throttler-proxy-guard';
import { SentryGlobalFilter, SentryModule } from '@sentry/nestjs/setup';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, dbConfig],
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        ...(await dbConfig()).db,
        appName: config.get<IAppConfig>('app').appName,
      }),
    }),

    CacheModule.register({
      isGlobal: true,
    }),

    ThrottlerModule.forRoot({
      ttl: 1,
      limit: 30,
    }),

    EventEmitterModule.forRoot({
      newListener: true,
      removeListener: true,
      verboseMemoryLeak: true,
    }),

    SentryModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerBehindProxyGuard },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_FILTER, useClass: SentryGlobalFilter },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(Sentry.Handlers.requestHandler()).forRoutes({
      path: '*',
      method: RequestMethod.ALL,
    });
  }
}
