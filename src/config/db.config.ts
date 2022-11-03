import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { IDataBaseConfig } from './config.interface';

const environment = process.env.NODE_ENV;

export default async (): Promise<{ db: IDataBaseConfig }> => ({
  db: {
    uri:
      environment === 'test'
        ? (await MongoMemoryReplSet.create({ replSet: { count: 1 } })).getUri()
        : process.env.MONGO_URI,
  },
});
