import { IDataBaseConfig } from './config.interface';

export default (): { db: IDataBaseConfig } => ({
  db: {
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017/nest',
  },
});
