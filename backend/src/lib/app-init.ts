import mongoose from 'mongoose';
import loadBoardIntoDatabase from '../loaders/board.loader';

type AppBootstrapCache = {
  mongooseConnectionPromise?: Promise<typeof mongoose>;
};

const globalForBootstrap = globalThis as typeof globalThis & AppBootstrapCache;

const connectToDatabase = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error('MONGODB_URI is not defined in the environment');
  }

  if (!globalForBootstrap.mongooseConnectionPromise) {
    globalForBootstrap.mongooseConnectionPromise = mongoose.connect(mongoUri);
  }

  await globalForBootstrap.mongooseConnectionPromise;
};

const ensureBoardIsLoaded = async () => {
  await loadBoardIntoDatabase();
};

export const ensureAppReady = async () => {
  await connectToDatabase();
  await ensureBoardIsLoaded();
};
