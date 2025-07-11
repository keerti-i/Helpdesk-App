const Category = require('../models/Category');

// Create new category
const createCategory = async (req, res) => {
  const { name } = req.body;

  if (!name) return res.status(400).json({ message: 'Category name is required' });

  try {
    const existing = await Category.findOne({ name });
    if (existing) return res.status(400).json({ message: 'Category already exists' });

    const category = await Category.create({ name });
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all categories
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find()
      .populate('assignedAgent', 'name') // <-- populate name only
      .sort({ createdAt: -1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Delete a category
const deleteCategory = async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createCategory, getCategories, deleteCategory };
