const { registerUser, loginUser, getAllUsers, updateUserRole } = require('../controllers/userController');
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected route
router.get('/profile', protect, (req, res) => {
  res.json({ message: 'Welcome, ' + req.user.name, role: req.user.role });
});
// Admin-only routes
router.get('/', protect, async (req, res, next) => {
  if (req.user.role !== 'Admin') return res.status(403).json({ message: 'Access denied' });
  next();
}, getAllUsers);

router.put('/:id/role', protect, async (req, res, next) => {
  if (req.user.role !== 'Admin') return res.status(403).json({ message: 'Access denied' });
  next();
}, updateUserRole);


module.exports = router;
