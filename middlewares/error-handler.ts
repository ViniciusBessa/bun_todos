import type { ErrorRequestHandler } from 'express';
import { CustomError } from '../errors/custom-error';
import { StatusCodes } from 'http-status-codes';

const errorHandlerMiddleware: ErrorRequestHandler = (err, req, res, next) => {
  if (err instanceof CustomError) {
    return res.status(err.statusCode).json({ err: err.message });
  }
  return res
    .status(StatusCodes.INTERNAL_SERVER_ERROR)
    .json({ err: 'An error occurred, try again later' });
};

export default errorHandlerMiddleware;
