import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { 
  createOrder,
  getOrder,
  updateOrderStatus,
  getTableOrders,
  getAllOrders
} from '../controllers/orderController.js';

const router = express.Router();

// ---------------------------
// PUBLIC ROUTES
// ---------------------------
router.post('/', createOrder);

// ---------------------------
// SPECIFIC ROUTES (must come BEFORE generic /:id route)
// ---------------------------
router.get('/table/:tableId', getTableOrders);

// ---------------------------
// PROTECTED ROUTES
// ---------------------------
router.get('/kitchen', authMiddleware(["kitchen", "admin"]), getAllOrders);
router.put('/status/:id', authMiddleware(["kitchen", "admin"]), updateOrderStatus);

// ---------------------------
// GENERIC ROUTES (must come LAST)
// ---------------------------
// This catches any /:id that wasn't matched by specific routes above
router.get('/:id', getOrder);

export default router;