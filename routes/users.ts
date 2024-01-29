import { Router } from 'express';
import {
  deleteAccount,
  deleteOwnAccount,
  getAllUsers,
  getSpecificUser,
  updateUser,
} from '../controllers/users';
import { loginRequiredMiddleware } from '../middlewares/login-required';
import { restrictAccessMiddleware } from '../middlewares/restrict-access';

const router = Router();

router
  .route('/')
  .get(loginRequiredMiddleware, restrictAccessMiddleware, getAllUsers);

router.route('/account').delete(loginRequiredMiddleware, deleteOwnAccount);

router
  .route('/:userId')
  .get(loginRequiredMiddleware, restrictAccessMiddleware, getSpecificUser)
  .patch(loginRequiredMiddleware, updateUser)
  .delete(loginRequiredMiddleware, restrictAccessMiddleware, deleteAccount);

export default router;
