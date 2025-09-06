// index.js
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import menuRoutes from './routes/menuRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js"
import prisma from './config/db.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  },
});

// Make io available to controllers (no circular imports)
app.set('io', io);

app.use(cors({
  origin: 'http://localhost:5173', // Your Vite dev server URL
  credentials: true
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());


// REST routes
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
// Admin routes
app.use("/api/admin", adminRoutes)
app.use("/api/auth", authRoutes)

/*
PUBLIC ROUTES (No auth needed - customers):
- GET    /api/menu
- GET    /api/menu/:id

ADMIN/KITCHEN ROUTES (Auth should be added later):
- POST   /api/menu
- PUT    /api/menu/:id
- DELETE /api/menu/:id
- POST   /api/orders
- PATCH  /api/orders/:id/status
- GET    /api/orders/table/:tableId (active/unpaid)
*/

// ----------------------- Socket.IO -----------------------
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Clients declare their role + (optional) tableId
  socket.on('join_room', ({ userType, tableId }) => {
    try {
      if (!userType) {
        socket.emit('error', { message: 'userType is required' });
        return;
      }

      switch (userType) {
        case 'customer': {
          if (!tableId) {
            socket.emit('error', { message: 'Table ID required for customer' });
            return;
          }
          socket.join(`table_${tableId}`);
          socket.userType = 'customer';
          socket.tableId = tableId;
          console.log(`Customer joined room: table_${tableId}`);
          socket.emit('roomJoined', { room: `table_${tableId}`, userType: 'customer' });
          break;
        }

        case 'kitchen': {
          socket.join('kitchen');
          socket.join('all_orders');
          socket.userType = 'kitchen';
          console.log('Kitchen staff connected');
          socket.emit('roomJoined', { room: 'kitchen', userType: 'kitchen' });
          break;
        }

        case 'admin': {
          socket.join('admin');
          socket.join('all_orders');
          socket.userType = 'admin';
          console.log('Admin connected');
          socket.emit('roomJoined', { room: 'admin', userType: 'admin' });
          break;
        }

        default:
          socket.emit('error', { message: 'Invalid user type' });
      }
    } catch (err) {
      console.error('join_room error:', err);
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  // Optional: socket fetch for active orders (live dashboards can call once on load)
  socket.on('getActiveOrders', async () => {
    try {
      if (socket.userType !== 'kitchen' && socket.userType !== 'admin') {
        socket.emit('error', { message: 'Unauthorized to view all orders' });
        return;
      }

      const activeOrders = await prisma.order.findMany({
        where: { status: { not: 'PAID' } },
        include: { items: true },
        orderBy: { createdAt: 'desc' },
      });

      socket.emit('activeOrdersData', activeOrders);
      console.log(`Sent active orders to ${socket.userType}`);
    } catch (error) {
      console.error('Error fetching active orders:', error);
      socket.emit('error', { message: 'Failed to fetch orders' });
    }
  });

  // Real-time status updates coming from staff via socket (optional; you also have REST)
  socket.on('updateOrderStatus', async ({ orderId, newStatus }) => {
    try {
      if (socket.userType !== 'kitchen' && socket.userType !== 'admin') {
        socket.emit('error', { message: 'Unauthorized to update order status' });
        return;
      }

      const updatedOrder = await prisma.order.update({
        where: { id: parseInt(orderId) },
        data: { status: newStatus },
        include: { items: true },
      });

      const { tableId } = updatedOrder;

      // Notify the specific table (customer)
      io.to(`table_${tableId}`).emit('orderStatusUpdate', updatedOrder);

      // Notify admin & kitchen dashboards
      io.to('admin').emit('orderStatusUpdate', updatedOrder);
      io.to('kitchen').emit('orderStatusUpdate', updatedOrder);

      // Ack to the updater
      socket.emit('statusUpdateConfirmed', {
        orderId,
        newStatus,
        message: 'Order status updated successfully',
      });

      console.log(`Order ${orderId} status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating order status via socket:', error);
      socket.emit('error', { message: 'Failed to update order status' });
    }
  });

  socket.on('disconnect', (reason) => {
    console.log(`Client disconnected: ${socket.id} (${socket.userType || 'unknown'}) - ${reason}`);
  });

  socket.on('connect_error', (error) => {
    console.error('Connection error:', error);
  });
});
// ---------------------------------------------------------

const PORT = process.env.PORT || 3000;

// IMPORTANT: listen on the HTTP server that Socket.IO uses
httpServer.listen(PORT, () => {
  console.log(`Server + Socket.IO running on port ${PORT}`);
});

export default app;
