import mongoose from 'mongoose';

async function connectDB(url: string) {
  return mongoose.connect(url, { authSource: 'admin' });
}

export { connectDB };
