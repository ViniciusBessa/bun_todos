import { StatusCodes } from 'http-status-codes';
import { CustomError } from '.';

export class UnauthorizedError extends CustomError {
  constructor(public message: string) {
    super(message, StatusCodes.UNAUTHORIZED);
  }
}
