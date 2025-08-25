// controllers/orderController.js
import prisma from '../config/db.js';

// Utility: validate enum safely
const ALLOWED_STATUS = new Set([
  'PENDING',
  'CONFIRMED',
  'PREPARING',
  'READY',
  'SERVED',
  'CANCELLED',
  'PAID',
]);

export const createOrder = async (req, res) => {
  try {
    const { tableId, items, totalItems, totalPrice } = req.body;

    // Basic validation
    if (
      tableId === undefined ||
      !Array.isArray(items) ||
      items.length === 0 ||
      totalItems === undefined ||
      totalPrice === undefined
    ) {
      return res.status(400).json({ error: 'Missing or invalid required fields' });
    }

    // Create order + nested items
    const order = await prisma.order.create({
      data: {
        tableId: parseInt(tableId),
        totalItems: parseInt(totalItems),
        totalPrice: parseFloat(totalPrice),
        // default status is PENDING by schema
        items: {
          create: items.map((item) => ({
            name: String(item.name),
            price: parseFloat(item.price),
            quantity: parseInt(item.quantity),
          })),
        },
      },
      include: { items: true },
    });

    // Emit real-time events
    const io = req.app.get('io'); // provided by app.set('io', io) in index.js
    if (io) {
      // Notify kitchen & admin dashboards about the new order
      io.to('kitchen').emit('newOrder', order);
      io.to('admin').emit('newOrder', order);

      // Notify the table (confirmation)
      io.to(`table_${order.tableId}`).emit('orderPlaced', order);
    }

    return res.status(201).json(order);
  } catch (error) {
    console.error('createOrder error:', error);
    return res.status(500).json({ error: error.message });
  }
};

// Get a single order by ID
export const getOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: { items: true },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    return res.json(order);
  } catch (error) {
    console.error('getOrder error:', error);
    return res.status(500).json({ error: error.message });
  }
};

// Update order status (DB-first, then emit)
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!ALLOWED_STATUS.has(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { status },
      include: { items: true },
    });

    // Emit to relevant rooms
    const io = req.app.get('io');
    if (io) {
      io.to(`table_${updatedOrder.tableId}`).emit('orderStatusUpdate', updatedOrder);
      io.to('admin').emit('orderStatusUpdate', updatedOrder);
      io.to('kitchen').emit('orderStatusUpdate', updatedOrder);
    }

    return res.json(updatedOrder);
  } catch (error) {
    console.error('updateOrderStatus error:', error);
    return res.status(500).json({ error: error.message });
  }
};

// All active (unpaid) orders for a table (customer re-scan/refresh)
export const getTableOrders = async (req, res) => {
  try {
    const { tableId } = req.params;

    const orders = await prisma.order.findMany({
      where: {
        tableId: parseInt(tableId),
        status: { not: 'PAID' }, // Only active orders
      },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });

    return res.json(orders);
  } catch (error) {
    console.error('getTableOrders error:', error);
    return res.status(500).json({ error: error.message });
  }
};
