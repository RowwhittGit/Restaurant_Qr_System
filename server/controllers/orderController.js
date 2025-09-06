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
    console.log("Incoming body:", req.body);
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

    // ✅ Validate that all items have menuId
    for (const item of items) {
      if (!item.menuId) {
        return res.status(400).json({ 
          error: `Item "${item.name}" is missing menuId` 
        });
      }
    }

    // ✅ Create order 
    const order = await prisma.order.create({
      data: {
        tableId: parseInt(tableId),
        totalItems: parseInt(totalItems),
        totalPrice: parseFloat(totalPrice),
        items: {
          create: items.map((item) => ({
            menuId: parseInt(item.menuId),
            quantity: parseInt(item.quantity),
            // Only use fields that exist in OrderItem schema
            // name and price come from the Menu relation
          })),
        },
      },
      include: { 
        items: {
          include: {
            menu: true  // ✅ Include menu details to get name, price, etc.
          }
        }
      },
    });

    // Emit real-time events
    const io = req.app.get('io');
    if (io) {
      io.to('kitchen').emit('newOrder', order);
      io.to('admin').emit('newOrder', order);
      io.to(`table_${order.tableId}`).emit('orderPlaced', order);
    }

    return res.status(201).json(order);
  } catch (error) {
    console.error('createOrder error:', error);
    return res.status(500).json({ error: error.message });
  }
};


// All active (unpaid) orders for the kitchen/admin view
export const getAllOrders = async (req, res) => {
  try {

    const orders = await prisma.order.findMany({
      where: {
        status: { not: 'PAID' }, // Only active orders
      },
      include: { 
        items: {
          include: {
            menu: true 
          }
        }
      },
      orderBy: { createdAt: 'asc' },
    });

    return res.json(orders);
  } catch (error) {
    console.error('getTableOrders error:', error);
    return res.status(500).json({ error: error.message });
  }
};

// Get a single order by ID
export const getOrder = async (req, res) => {
  try {
    const { id } = req.params;

    // Handle "all" separately
    if (id === "all") {
      const orders = await prisma.order.findMany({
        include: {
          items: { include: { menu: true } }
        },
      });
      return res.json(orders);
    }

    const orderId = parseInt(id, 10);
    if (isNaN(orderId)) {
      return res.status(400).json({ error: "Invalid order ID please check" });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { 
        items: { include: { menu: true } }
      },
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    return res.json(order);
  } catch (error) {
    console.error("getOrder error:", error);
    return res.status(500).json({ error: error.message });
  }
};


// Update order status (DB-first, then emit)
export const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const updatedOrder = await prisma.order.update({
      where: { id: Number(id) },
      data: { status }
    });

    const io = req.app.get('io');
    if (io) {
      // Notify the specific table (customer)
      io.to(`table_${updatedOrder.tableId}`).emit('orderStatusUpdate', updatedOrder);

      // Notify admin & kitchen dashboards
      io.to('admin').emit('orderStatusUpdate', updatedOrder);
      io.to('kitchen').emit('orderStatusUpdate', updatedOrder);
    }

    res.status(200).json(updatedOrder).message = "Status updated";
  } catch (error) {
    res.status(500).json({ error: "Failed to update status" });
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
      include: { 
        items: {
          include: {
            menu: true  // ✅ Include menu details
          }
        }
      },
      orderBy: { createdAt: 'asc' },
    });

    return res.json(orders);
  } catch (error) {
    console.error('getTableOrders error:', error);
    return res.status(500).json({ error: error.message });
  }
};