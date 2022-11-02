import { MongooseModuleOptions } from '@nestjs/mongoose';

export interface IAppConfig {
  port: number;
  environment: Environment;
  appName: string;
}

export type Environment = 'development' | 'production' | 'test' | 'staging';

export type IDataBaseConfig = MongooseModuleOptions;
