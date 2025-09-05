import express from 'express';
const router = express.Router();

import {getWeeklySales} from '../controllers/AdminController.js'

// GET /api/admin/weekly-sales - Get weekly sales data
router.get('/weekly-sales', getWeeklySales);

export default router;