import express from 'express';
const router = express.Router();

import { login, refresh } from '../controllers/authController.js';


//Done
router.post('/login', login);
router.post('/refresh', refresh); 
export default router;