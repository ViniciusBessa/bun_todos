import { Router } from 'express';
import { loginRequiredMiddleware } from '../middlewares/login-required';
import {
  createTask,
  deleteTask,
  getAllTasks,
  getSpecificTask,
  updateTask,
} from '../controllers/tasks';

const router = Router();

router
  .route('/')
  .get(loginRequiredMiddleware, getAllTasks)
  .post(loginRequiredMiddleware, createTask);

router
  .route('/:taskId')
  .get(loginRequiredMiddleware, getSpecificTask)
  .patch(loginRequiredMiddleware, updateTask)
  .delete(loginRequiredMiddleware, deleteTask);

export default router;
