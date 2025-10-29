import * as Sentry from '@sentry/nestjs';
import '@sentry/tracing';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

Sentry.init({
  dsn: process.env.SENTRY_DNS,
  integrations: [nodeProfilingIntegration()],
  // Tracing
  tracesSampleRate: 1.0, //  Capture 100% of the transactions
  // Set sampling rate for profiling - this is relative to tracesSampleRate
  profilesSampleRate: 1.0,
  environment: process.env.APP_ENV,
  debug: false,
  attachStacktrace: true,
  serverName: process.env.APP_NAME,
});
