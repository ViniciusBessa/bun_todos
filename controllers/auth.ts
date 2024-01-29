import asyncWrapper from '../middlewares/async-wrapper';
import type { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { StatusCodes } from 'http-status-codes';
import { BadRequestError, NotFoundError } from '../errors';
import {
  USER_MESSAGES,
  loginUserSchema,
  registerUserSchema,
} from '../utils/ajv-validations/auth-validations';

const registerUser = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password } = req.body;
    // Validating the name, email and password
    try {
      await registerUserSchema({ name, email, password });
    } catch (error: any) {
      const errorMessage = error.errors[0].message as string;
      throw new BadRequestError(errorMessage);
    }

    // Creating the user in the database
    const user = await User.create({ name, email, password });

    // Getting the user payload and generating a token for authentication
    const userPayload = await user.getPayload();
    const token = await user.createToken(userPayload);

    return res.status(StatusCodes.CREATED).json({ user: userPayload, token });
  }
);

const loginUser = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    // Validating the email and password
    try {
      await loginUserSchema({ email, password });
    } catch (error: any) {
      const errorMessage = error.errors[0].message as string;

      if (errorMessage.includes('was found')) {
        throw new NotFoundError(errorMessage);
      }
      throw new BadRequestError(errorMessage);
    }
    const user = await User.findOne({ email });

    // Comparing the password submitted by the user to the one in the database
    const passwordMatches = await user!.comparePassword(password);

    if (!passwordMatches) {
      throw new BadRequestError(USER_MESSAGES.PASSWORD_INCORRECT);
    }
    // Getting the user payload and generating a token for authentication
    const userPayload = await user!.getPayload();
    const token = await user!.createToken(userPayload);
    return res.status(StatusCodes.OK).json({ user: userPayload, token });
  }
);

const userInfo = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { user } = req;

    // Getting the user payload and generating a token for authentication
    const userPayload = await user!.getPayload();
    const token = await user!.createToken(userPayload);

    return res.status(StatusCodes.OK).json({ user: userPayload, token });
  }
);

export { registerUser, loginUser, userInfo };
