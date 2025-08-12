const prisma = require("../config/db");

// CREATE Menu Item
exports.createMenuItem = async (req, res, next) => {
  try {
    const { name, description, price } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const menuItem = await prisma.menu.create({
      data: { name, description, price: parseFloat(price), imageUrl }
    });

    res.status(201).json(menuItem);
  } catch (error) {
    next(error);
  }
};

// GET All Menu Items
exports.getAllMenuItems = async (req, res, next) => {
  try {
    const menu = await prisma.menu.findMany();
    res.json(menu);
  } catch (error) {
    next(error);
  }
};

// UPDATE Menu Item
exports.updateMenuItem = async (req, res, next) => {
  try {
    const { name, description, price } = req.body;
    const updateData = { name, description, price: parseFloat(price) };

    if (req.file) {
      updateData.imageUrl = `/uploads/${req.file.filename}`;
    }

    const updatedMenu = await prisma.menu.update({
      where: { id: parseInt(req.params.id) },
      data: updateData
    });

    res.json(updatedMenu);
  } catch (error) {
    next(error);
  }
};

// DELETE Menu Item
exports.deleteMenuItem = async (req, res, next) => {
  try {
    await prisma.menu.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ message: "Menu item deleted" });
  } catch (error) {
    next(error);
  }
};
