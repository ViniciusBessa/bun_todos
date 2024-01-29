import type { NextFunction, Request, Response } from 'express';
import { UnauthorizedError } from '../errors';
import asyncWrapper from './async-wrapper';

const UNAUTHORIZED_ERROR_MESSAGE =
  "It's necessary to login to see this content";

const loginRequiredMiddleware = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError(UNAUTHORIZED_ERROR_MESSAGE);
    }
    return next();
  }
);

export { loginRequiredMiddleware, UNAUTHORIZED_ERROR_MESSAGE };
