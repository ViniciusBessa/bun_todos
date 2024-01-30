import asyncWrapper from '../middlewares/async-wrapper';
import type { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { BadRequestError, ForbiddenError, NotFoundError } from '../errors';
import {
  createTaskSchema,
  getTaskSchema,
  updateTaskSchema,
} from '../utils/ajv-validations/tasks-validations';
import { Task } from '../models/Task';
import { FORBIDDEN_ERROR_MESSAGE } from '../middlewares/restrict-access';

const getAllTasks = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { user } = req;

    let tasks = [];

    if (user.role === 'ADMIN') {
      // Getting all tasks in the database if the user is an admin
      tasks = await Task.find().select('_id title description completed');
    } else {
      // Getting all tasks of the user
      tasks = await Task.find({ user: user.id }).select(
        '_id title description completed'
      );
    }
    return res.status(StatusCodes.OK).json({ tasks });
  }
);

const getSpecificTask = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { user } = req;
    const { taskId } = req.params;

    // Validating the id passed through the parameters
    try {
      await getTaskSchema({ id: taskId });
    } catch (error: any) {
      const errorMessage = error.errors[0].message as string;
      throw new NotFoundError(errorMessage);
    }

    // Getting the task
    const task = await Task.findById(taskId);

    // Checking if the user should have access to this task
    if (
      user.role !== 'ADMIN' &&
      task!.user.toString() !== user._id.toString()
    ) {
      throw new ForbiddenError(FORBIDDEN_ERROR_MESSAGE);
    }
    return res.status(StatusCodes.OK).json({
      task: {
        _id: task!._id,
        title: task!.title,
        description: task!.description,
        completed: task!.completed,
      },
    });
  }
);

const createTask = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { title, description, completed } = req.body;
    const { user } = req;

    // Validating the data passed through the request
    try {
      await createTaskSchema({
        title,
        description,
        completed,
        userId: user.id,
      });
    } catch (error: any) {
      const errorMessage = error.errors[0].message as string;

      if (errorMessage.includes('was found')) {
        throw new NotFoundError(errorMessage);
      }
      throw new BadRequestError(errorMessage);
    }

    // Creating the task and responding
    const task = await Task.create({
      title,
      description,
      completed,
      user: user.id,
    });
    return res.status(StatusCodes.CREATED).json({
      task: {
        _id: task._id,
        title: task.title,
        description: task.description,
        completed: task.completed,
      },
    });
  }
);

const updateTask = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { user } = req;
    const { taskId } = req.params;
    const { title, description, completed } = req.body;

    // Validating the data passed through the request
    try {
      await updateTaskSchema({
        id: taskId,
        title,
        description,
        completed,
      });
    } catch (error: any) {
      const errorMessage = error.errors[0].message as string;

      if (errorMessage.includes('was found')) {
        throw new NotFoundError(errorMessage);
      }
      throw new BadRequestError(errorMessage);
    }

    // Checking if the user should be able to update this task
    const task = await Task.findById(taskId);

    if (task!.user.toString() !== user._id.toString()) {
      throw new ForbiddenError(FORBIDDEN_ERROR_MESSAGE);
    }

    // Updating the task and responding
    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      {
        title,
        description,
        completed,
      },
      { new: true }
    ).select('_id title description completed');
    return res.status(StatusCodes.OK).json({ task: updatedTask });
  }
);

const deleteTask = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { user } = req;
    const { taskId } = req.params;

    // Validating the id passed through the parameters
    try {
      await getTaskSchema({ id: taskId });
    } catch (error: any) {
      const errorMessage = error.errors[0].message as string;
      throw new NotFoundError(errorMessage);
    }

    // Checking if the user should be able to delete this task
    const task = await Task.findById(taskId);

    if (
      task!.user.toString() !== user._id.toString() &&
      user.role !== 'ADMIN'
    ) {
      throw new ForbiddenError(FORBIDDEN_ERROR_MESSAGE);
    }

    // Deleting the task from the database and responding
    await Task.findByIdAndDelete(taskId);
    return res.status(StatusCodes.OK).json({
      task: {
        _id: task!._id,
        title: task!.title,
        description: task!.description,
        completed: task!.completed,
      },
    });
  }
);

export { getAllTasks, getSpecificTask, createTask, updateTask, deleteTask };
