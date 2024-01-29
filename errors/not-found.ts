import { StatusCodes } from 'http-status-codes';
import { CustomError } from '.';

export class NotFoundError extends CustomError {
  constructor(public message: string) {
    super(message, StatusCodes.NOT_FOUND);
  }
}
