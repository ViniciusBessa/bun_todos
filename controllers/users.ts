import type { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { BadRequestError, ForbiddenError, NotFoundError } from '../errors';
import asyncWrapper from '../middlewares/async-wrapper';
import {
  USER_MESSAGES,
  deleteOwnUserSchema,
  getUserSchema,
  updateUserSchema,
} from '../utils/ajv-validations/auth-validations';
import { FORBIDDEN_ERROR_MESSAGE } from '../middlewares/restrict-access';
import { User } from '../models/User';

const getAllUsers = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const users = await User.find().select(
      '_id name email role createdAt updatedAt'
    );
    return res.status(StatusCodes.OK).json({ users });
  }
);

const getSpecificUser = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;

    try {
      await getUserSchema({ id: userId });
    } catch (error: any) {
      const errorMessage = error.errors[0].message as string;
      throw new NotFoundError(errorMessage);
    }
    const user = await User.findById(userId).select(
      '_id name email role createdAt updatedAt'
    );
    return res.status(StatusCodes.OK).json({ user });
  }
);

const updateUser = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { user } = req;
    const { userId } = req.params;
    let { name, email, password } = req.body;

    if (user.id !== userId) {
      throw new ForbiddenError(FORBIDDEN_ERROR_MESSAGE);
    }

    // Validating the info submitted
    try {
      await updateUserSchema({ id: userId, name, email, password });
    } catch (error: any) {
      const errorMessage = error.errors[0].message as string;

      if (errorMessage.includes('was found')) {
        throw new NotFoundError(errorMessage);
      }
      throw new BadRequestError(errorMessage);
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        name,
        email,
        password,
      },
      { new: true }
    );

    // Getting the user payload and generating a token for authentication
    const userPayload = await updatedUser!.getPayload();
    const token = await updatedUser!.createToken(userPayload);

    return res.status(StatusCodes.OK).json({ user: userPayload, token });
  }
);

const deleteAccount = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;

    try {
      await getUserSchema({ id: userId });
    } catch (error: any) {
      const errorMessage = error.errors[0].message as string;
      throw new NotFoundError(errorMessage);
    }

    const user = await User.findByIdAndDelete(userId);

    // Getting the user payload
    const userPayload = await user!.getPayload();

    return res.status(StatusCodes.OK).json({ user: userPayload });
  }
);

const deleteOwnAccount = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { user } = req;
    const { password } = req.body;

    try {
      await deleteOwnUserSchema({ id: user.id, password });
    } catch (error: any) {
      const errorMessage = error.errors[0].message as string;

      if (errorMessage.includes('was found')) {
        throw new NotFoundError(errorMessage);
      }
      throw new BadRequestError(errorMessage);
    }

    const userAccount = await User.findById(user.id);

    // Comparing the password submitted by the user to the one in the database
    const passwordMatches = await userAccount!.comparePassword(password);

    if (!passwordMatches) {
      throw new BadRequestError(USER_MESSAGES.PASSWORD_INCORRECT);
    }

    await User.findByIdAndDelete(user.id);

    // Getting the user payload
    const userPayload = await userAccount!.getPayload();
    return res.status(StatusCodes.OK).json({ user: userPayload });
  }
);

export {
  getAllUsers,
  getSpecificUser,
  updateUser,
  deleteAccount,
  deleteOwnAccount,
};
