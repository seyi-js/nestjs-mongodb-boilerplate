import { ClientSession, Model } from 'mongoose';

export const sessionHelper = () => {
  return {
    startSession,
    endSession,
    startTransaction,
    endTransaction,
    commitTransaction,
  };
};

const startSession = async (model: Model<any>) => {
  return await model.startSession();
};

const endSession = async (session: ClientSession) => {
  return await session.endSession();
};

const startTransaction = (session: ClientSession) => {
  const options: any = {
    readPreference: 'primary',
    readConcern: {
      level: 'local',
    },
    writeConcern: {
      w: 'majority',
    },
  };

  return session.startTransaction(options);
};

const endTransaction = async (session: ClientSession) => {
  const isInTransaction = session.inTransaction();
  return isInTransaction ? await session.abortTransaction() : null;
};

const commitTransaction = async (session: ClientSession) => {
  return await session.commitTransaction();
};
