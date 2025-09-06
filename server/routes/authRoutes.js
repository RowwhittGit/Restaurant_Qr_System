import express from 'express';
const router = express.Router();

import { login } from '../controllers/authController.js';


//Done
router.post('/login', login);
export default router;