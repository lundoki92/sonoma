import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { auth } from '../middlewares/auth.js';

export const authRouter = Router();

authRouter.post('/register', authController.register);
authRouter.post('/login', authController.login);
authRouter.post('/logout', authController.logout);
authRouter.get('/myprofile', auth, authController.myprofile);