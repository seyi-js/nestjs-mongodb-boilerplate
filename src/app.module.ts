import { CacheModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import appConfig from './config/app.config';
import { IAppConfig } from './config/config.interface';
import dbConfig from './config/db.config';
import { ThrottlerBehindProxyGuard } from './middleware/throttler-proxy-guard';
import { SentryModule } from './modules/sentry/sentry.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, dbConfig],
    }),

    MongooseModule.forRootAsync({
      useFactory: async (config: ConfigService) => ({
        ...dbConfig().db,
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

    SentryModule.forRoot({
      dsn: process.env.SENTRY_DNS,
      environment: process.env.APP_ENV,
      tracesSampleRate: 1.0,
      debug: true,
      attachStacktrace: true,
      serverName: process.env.APP_NAME,
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerBehindProxyGuard },
  ],
})
export class AppModule {}
