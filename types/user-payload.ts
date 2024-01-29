import { Role } from '@prisma/client';

export interface UserPayload {
  id: number;
  name: string;
  email: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}
