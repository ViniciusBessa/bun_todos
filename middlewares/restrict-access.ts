import type { NextFunction, Request, Response } from 'express';
import { ForbiddenError } from '../errors';
import asyncWrapper from './async-wrapper';

const FORBIDDEN_ERROR_MESSAGE =
  "You don't have the permission to access this content";

const restrictAccessMiddleware = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenError(FORBIDDEN_ERROR_MESSAGE);
    }
    return next();
  }
);

export { restrictAccessMiddleware, FORBIDDEN_ERROR_MESSAGE };
