import mongoose from 'mongoose';
import { connectDB } from './db';
import { User } from '../models/User';
import { Task } from '../models/Task';

async function main() {
  // Connecting to the database
  await connectDB(Bun.env.MONGO_URI as string);

  // Deleting all data in the collections
  await User.deleteMany();
  await Task.deleteMany();

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

  await User.create({
    name: 'Rosalinda Astrid',
    email: 'rosalinda@gmail.com',
    password: 'rosalindaastrid',
    role: 'USER',
  });

  await User.create({
    name: 'John Astrid',
    email: 'john@gmail.com',
    password: 'johnastrid',
    role: 'USER',
  });

  await User.create({
    name: 'Richard Astrid',
    email: 'richard@gmail.com',
    password: 'richardastrid',
    role: 'ADMIN',
  });

  await User.create({
    _id: '65b8060302c0c7f1643f3392',
    name: 'Roberto Alfredo',
    email: 'roberto@gmail.com',
    password: 'robertoalfredo',
    role: 'USER',
  });

  await User.create({
    name: 'James Williams',
    email: 'james@gmail.com',
    password: 'jameswilliams',
    role: 'USER',
  });

  // Tasks
  await Task.create({
    _id: '65b8060302c0c7f1643f3310',
    title: 'Task Number 1',
    description: 'The first task of the day',
    user: syntyche._id,
  });

  await Task.create({
    _id: '65b8060302c0c7f1643f3311',
    title: 'Task Number 2',
    description: 'The second task of the day',
    completed: true,
    user: taqqiq._id,
  });

  await Task.create({
    _id: '65b8060302c0c7f1643f3312',
    title: 'Task Number 3',
    description: 'The third task of the day',
    user: syntyche._id,
  });

  await Task.create({
    _id: '65b8060302c0c7f1643f3313',
    title: 'Task Number 4',
    description: 'The fourth task of the day',
    user: taqqiq._id,
  });

  await Task.create({
    _id: '65b8060302c0c7f1643f3314',
    title: 'Task Number 5',
    description: 'The fifth task of the day',
    user: syntyche._id,
  });

  await Task.create({
    _id: '65b8060302c0c7f1643f3315',
    title: 'Task Number 6',
    description: 'The sixth task of the day',
    user: taqqiq._id,
  });

  await Task.create({
    _id: '65b8060302c0c7f1643f3316',
    title: 'Task Number 7',
    description: 'The seventh task of the day',
    user: taqqiq._id,
  });
}

await main()
  .then(async () => await mongoose.disconnect())
  .catch(async (error) => {
    console.log(error);
    await mongoose.disconnect();
    process.exit(1);
  });
