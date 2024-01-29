import mongoose from 'mongoose';

async function connectDB(url: string) {
  return mongoose.connect(url);
}

export { connectDB };
