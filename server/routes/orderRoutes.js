import express from 'express';
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
router.get('/kitchen', getAllOrders);


//this will be a protected route for kitchen/admin to update order status
router.put('/:id/status', updateOrderStatus);

export default router;