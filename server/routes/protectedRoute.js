const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');

router.get('/profile', authenticateToken, (req, res) => {
  res.json({ message: 'This is a protected profile route', user: req.user });
});

module.exports = router;
