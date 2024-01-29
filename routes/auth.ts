import { Router } from 'express';
import { registerUser, loginUser, userInfo } from '../controllers/auth';
import { loginRequiredMiddleware } from '../middlewares/login-required';

const router = Router();

router.route('/register').post(registerUser);

router.route('/login').post(loginUser);

router.route('/user').get(loginRequiredMiddleware, userInfo);

export default router;
