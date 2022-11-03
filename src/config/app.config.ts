import { Environment, IAppConfig } from './config.interface';

export default (): { app: IAppConfig } => ({
  app: {
    port: parseInt(process.env.APP_PORT, 10) || 3000,
    environment: (process.env.APP_ENV as Environment) || 'development',
    appName: process.env.APP_NAME,
  },
});
