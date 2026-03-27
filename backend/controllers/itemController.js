import Item from "../models/Item.js";

// @desc    Get all items
// @route   GET /api/items
// @access  Public
export const getItems = async (req, res) => {
  try {
    const items = await Item.find({});
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Create an item
// @route   POST /api/items
// @access  Public
export const createItem = async (req, res) => {
  try {
    const { name, description, price } = req.body;
    const item = new Item({
      name,
      description,
      price,
    });
    const createdItem = await item.save();
    res.status(201).json(createdItem);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
