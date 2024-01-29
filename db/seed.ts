import mongoose from 'mongoose';
import { connectDB } from './db';
import { User } from '../models/User';

async function main() {
  // Connecting to the database
  await connectDB(Bun.env.MONGO_URI as string);

  // Deleting all data in the collections
  await User.deleteMany();

  // Users
  const syntyche = await User.create({
    _id: '65b8060302c0c7f1643f3390',
    name: 'Syntyche Joann',
    email: 'syntyche@gmail.com',
    password: 'syntychejoann',
    role: 'ADMIN',
  });

  const taqqiq = await User.create({
    name: 'Taqqiq Berlin',
    email: 'taqqiq@gmail.com',
    password: 'taqqiqberlin',
    role: 'USER',
  });

  const rosalinda = await User.create({
    name: 'Rosalinda Astrid',
    email: 'rosalinda@gmail.com',
    password: 'rosalindaastrid',
    role: 'USER',
  });

  const john = await User.create({
    name: 'John Astrid',
    email: 'john@gmail.com',
    password: 'johnastrid',
    role: 'USER',
  });

  const richard = await User.create({
    name: 'Richard Astrid',
    email: 'richard@gmail.com',
    password: 'richardastrid',
    role: 'ADMIN',
  });

  const roberto = await User.create({
    _id: '65b8060302c0c7f1643f3392',
    name: 'Roberto Alfredo',
    email: 'roberto@gmail.com',
    password: 'robertoalfredo',
    role: 'USER',
  });

  const james = await User.create({
    name: 'James Williams',
    email: 'james@gmail.com',
    password: 'jameswilliams',
    role: 'USER',
  });
}

await main()
  .then(async () => await mongoose.disconnect())
  .catch(async (error) => {
    console.log(error);
    await mongoose.disconnect();
    process.exit(1);
  });
