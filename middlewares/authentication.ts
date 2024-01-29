import { User } from '../models/User';
import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Getting the authorization header
    const { authorization } = req.headers;

    // If there is no value in authorization value, just continue with the user not authenticated
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return next();
    }

    // Getting the token from the authorization header
    const token = authorization.split(' ')[1];

    // Getting the user from the database
    const userPayload = await verifyToken(token);
    const user = await User.findOne({
      name: userPayload.name,
      email: userPayload.email,
    });

    // If the user was found, attach the instance to the request
    if (user) {
      req.user = user;
    }
    return next();
  } catch {
    return next();
  }
};

export default authMiddleware;
