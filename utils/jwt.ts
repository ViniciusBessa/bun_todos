import { jwtVerify } from 'jose';
import type { UserPayload } from '../types/user-payload';

const verifyToken = async (token: string): Promise<UserPayload> => {
  const userPayload = await jwtVerify(
    token,
    new TextEncoder().encode(Bun.env.JWT_SECRET as string)
  );
  return userPayload.payload as unknown as UserPayload;
};

export { verifyToken };
