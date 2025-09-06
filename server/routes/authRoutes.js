import express from 'express';
const router = express.Router();

import { login, refresh, logout } from '../controllers/authController.js';


//Done
router.post('/login', login);
router.post('/refresh', refresh); 
router.post('/logout', logout); 
export default router;