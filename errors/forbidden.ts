import { StatusCodes } from 'http-status-codes';
import { CustomError } from '.';

export class ForbiddenError extends CustomError {
  constructor(public message: string) {
    super(message, StatusCodes.FORBIDDEN);
  }
}
