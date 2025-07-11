const express = require('express');
const Category = require('../models/Category');
const router = express.Router();
const {
  createCategory,
  getCategories,
  deleteCategory,
} = require('../controllers/categoryController');
const { protect } = require('../middleware/authMiddleware');

// Protect all category routes — ideally only for Admin
router.post('/', protect, createCategory);
router.get('/', protect, getCategories);
router.delete('/:id', protect, deleteCategory);

router.put('/:id', protect, async (req, res, next) => {
  if (req.user.role !== 'Admin') return res.status(403).json({ message: 'Access denied' });
  next();
}, async (req, res) => {
  const { name, assignedAgent } = req.body;
  try {
    const updated = await Category.findByIdAndUpdate(
      req.params.id,
      { name, assignedAgent },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
