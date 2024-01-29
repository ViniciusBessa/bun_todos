import type { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';

const NOT_FOUND_MESSAGE = 'Page not found';

const notFoundMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  return res.status(StatusCodes.NOT_FOUND).json({ err: NOT_FOUND_MESSAGE });
};

export { notFoundMiddleware, NOT_FOUND_MESSAGE };
