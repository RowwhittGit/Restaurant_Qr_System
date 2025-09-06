import express from 'express';
const router = express.Router();
import { login } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

import {getWeeklySales, getTodaysPeakSales, getWeeklyBestSellers} from '../controllers/AdminController.js'

// GET /api/admin/weekly-sales - Get weekly sales data
router.get('/weekly-sales', getWeeklySales);

//GET today's peak sales time (hourly breakdown)
router.get('/peak-sales', getTodaysPeakSales);

//Get best selling menu items in last 7 days
router.get("/weekly-best-sellers", getWeeklyBestSellers);

export default router;