import express from 'express';
const router = express.Router();
import { 
  getAllMenus, 
  getMenuById, 
  createMenu, 
  updateMenu, 
  deleteMenu,
  getAllMenuAdmin,
  HideOrShowMenu
} from '../controllers/menuController.js';

// PUBLIC ROUTES (No authentication required - for customers)
// GET /api/menu - Get all menu items (customers can view)
router.get('/', getAllMenus);
router.get('/adminMenu', getAllMenuAdmin);


// GET /api/menu/:id - Get single menu item (customers can view)
router.get('/:id', getMenuById);

// ADMIN ROUTES (Authentication required)
// POST /api/menu - Create new menu item (admin only)
router.post('/',  createMenu);

// PATCH /api/menu/:id - Hide or show menu item (admin only)
router.patch('/:id/availability', HideOrShowMenu);

// PUT /api/menu/:id - Update menu item (admin only)
router.put('/:id', updateMenu);

// DELETE /api/menu/:id - Delete menu item (admin only)
router.delete('/:id', deleteMenu);

export default router;