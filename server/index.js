import express from 'express';
import menuRoutes from './routes/menuRoutes.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/api/menu', menuRoutes);

// Example of how the routes will work:
/*
PUBLIC ROUTES (No auth needed - customers):
- GET /api/menu           → Get all menu items
- GET /api/menu/1         → Get menu item with ID 1

ADMIN ROUTES (Auth required):
- POST /api/menu          → Create new menu item
- PUT /api/menu/1         → Update menu item with ID 1  
- DELETE /api/menu/1      → Delete menu item with ID 1
*/

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;