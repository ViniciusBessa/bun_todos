import type mongoose from 'mongoose';

export interface UserPayload {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  role: 'ADMIN' | 'USER';
  createdAt: NativeDate;
  updatedAt: NativeDate;
}
