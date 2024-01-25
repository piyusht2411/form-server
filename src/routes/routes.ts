import express, {Router, Express, Request, Response , Application} from 'express';
import {register, login,logout} from '../controllers/userController';

const router = Router();
router.post('/register', register);
router.post('/login', login);

export default router;