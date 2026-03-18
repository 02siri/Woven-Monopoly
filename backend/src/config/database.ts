import mongoose from 'mongoose';

const connectToDatabase = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error('MONGODB_URI is not defined in the environment');
  }

  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB');
};

export default connectToDatabase;
