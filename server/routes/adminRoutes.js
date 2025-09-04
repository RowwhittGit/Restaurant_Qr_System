// this contains all home routes for admin
import express from "express";
import { getRevenueAnalytics, getPeakTodaySales } from "../controllers/adminController.js";

const router = express.Router();

// Example routes
router.get('/analytics/revenue', getRevenueAnalytics);
router.get('/sales/peak', getPeakTodaySales);

export default router;

/*
Today's revenue
GET /api/admin/analytics/revenue?period=today

This week's revenue
GET /api/admin/analytics/revenue?period=week

This month's revenue grouped by day
GET /api/admin/analytics/revenue?period=month&groupBy=day

Custom date range
GET /api/admin/analytics/revenue?period=custom&startDate=2024-01-01&endDate=2024-01-31

Hourly breakdown for today
GET /api/admin/analytics/revenue?period=today&groupBy=hour
*/