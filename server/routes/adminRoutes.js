// this contains all home routes for admin

import express from "express";
import {
  getOrdersByDate,
  getDailySales,
  getBestSellers,
  getOrdersByStatus,
  getPeakHours,
} from "../controllers/AdminController.js";

const router = express.Router();

// Example routes
router.get("/orders/by-date", getOrdersByDate);
router.get("/analytics/daily-sales", getDailySales);
router.get("/analytics/best-sellers", getBestSellers);
router.get("/analytics/status", getOrdersByStatus);
router.get("/analytics/peak-hours", getPeakHours);

export default router;
