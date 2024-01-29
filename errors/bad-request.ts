import { StatusCodes } from 'http-status-codes';
import { CustomError } from '.';

export class BadRequestError extends CustomError {
  constructor(public message: string) {
    super(message, StatusCodes.BAD_REQUEST);
  }
}
