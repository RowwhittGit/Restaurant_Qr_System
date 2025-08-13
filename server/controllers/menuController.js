import prisma from '../config/db.js';

// Get all menu items
const getAllMenus = async (req, res) => {
  try {
    const menus = await prisma.menu.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.status(200).json({
      success: true,
      data: menus,
      message: 'Menu items fetched successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching menu items',
      error: error.message
    });
  }
};


// Create new menu item
const createMenu = async (req, res) => {
  try {
    const { name, price, image } = req.body;

    if (!name || !price) {
      return res.status(400).json({
        success: false,
        message: 'Name and price are required fields'
      });
    }

    const menu = await prisma.menu.create({
      data: {
        name,
        price: parseFloat(price),
        image: image || null
      }
    });

    res.status(201).json({
      success: true,
      message: `${name} added successfully`,
      data: menu
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating menu item',
      error: error.message
    });
  }
};

// Get single menu item by ID
const getMenuById = async (req, res) => {
  try {
    const { id } = req.params;
    const menu = await prisma.menu.findUnique({
      where: {
        id: parseInt(id)
      }
    });

    if (!menu) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    res.status(200).json({
      success: true,
      data: menu
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching menu item',
      error: error.message
    });
  }
};

// Update menu item
const updateMenu = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, image } = req.body;

    const existingMenu = await prisma.menu.findUnique({
      where: {
        id: parseInt(id)
      }
    });

    if (!existingMenu) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (image !== undefined) updateData.image = image;

    const updatedMenu = await prisma.menu.update({
      where: {
        id: parseInt(id)
      },
      data: updateData
    });

    res.status(200).json({
      success: true,
      message: 'Menu item updated successfully',
      data: updatedMenu
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating menu item',
      error: error.message
    });
  }
};

// Delete menu item
const deleteMenu = async (req, res) => {
  try {
    const { id } = req.params;

    const existingMenu = await prisma.menu.findUnique({
      where: {
        id: parseInt(id)
      }
    });

    if (!existingMenu) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    await prisma.menu.delete({
      where: {
        id: parseInt(id)
      }
    });

    res.status(200).json({
      success: true,
      message: 'Menu item deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting menu item',
      error: error.message
    });
  }
};

export {
  getAllMenus,
  getMenuById,
  createMenu,
  updateMenu,
  deleteMenu
};