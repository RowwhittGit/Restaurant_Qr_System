import express from 'express';
const router = express.Router();

import { login } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

import { 
  getAllMenus, 
  // getMenuById,
  createMenu, 
  updateMenu, 
  deleteMenu,
  getAllMenuAdmin,
  HideOrShowMenu
} from '../controllers/menuController.js';

// ---------------------------
// LOGIN
// ---------------------------
router.post('/login', login);

// ---------------------------
// PUBLIC ROUTES (customers)
// ---------------------------
// Customers can view menus without auth
router.get('/', getAllMenus);
// router.get('/:id', getMenuById);  

// ---------------------------
// ADMIN ROUTES (protected)
// ---------------------------
// Only admins can access below
router.use(authMiddleware(["admin"]));

// Get all menus for admin panel
router.get('/adminMenu', getAllMenuAdmin);

// Create new menu
router.post('/', createMenu);

// Hide/show menu
router.patch('/:id/availability', HideOrShowMenu);

// Update menu
router.put('/:id', updateMenu);

// Delete menu
router.delete('/:id', deleteMenu);

export default router;
