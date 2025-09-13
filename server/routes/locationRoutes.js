import express from 'express';
const router = express.Router();

import { checkLocation } from '../controllers/locationController.js';

router.post('/', checkLocation);

export default router;