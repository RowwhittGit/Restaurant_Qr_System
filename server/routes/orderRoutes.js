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

router.post('/', createOrder);
// router.get('/:id', getOrder);
router.get('/table/:tableId', getTableOrders);
router.get('/:id', getOrder);



//this will be a protected route for kitchen/admin to update order status
router.use(authMiddleware(["kitchen", "admin"]));
router.get('/kitchen', getAllOrders);
router.put('/status/:id', updateOrderStatus);

export default router;