import { User } from '@prisma/client';
import { jwtVerify, SignJWT } from 'jose';
import { UserPayload } from '../types/user-payload';

const getUserPayload = async (user: User): Promise<UserPayload> => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

const createToken = async (userPayload: UserPayload): Promise<string> => {
  const token = await new SignJWT({ ...userPayload })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(Bun.env.JWT_EXPIRES_IN || '30d')
    .sign(new TextEncoder().encode(Bun.env.JWT_SECRET as string));
  return token;
};

const verifyToken = async (token: string): Promise<UserPayload> => {
  const userPayload = await jwtVerify(
    token,
    new TextEncoder().encode(Bun.env.JWT_SECRET as string)
  );
  return userPayload.payload as unknown as UserPayload;
};

export { getUserPayload, createToken, verifyToken };
