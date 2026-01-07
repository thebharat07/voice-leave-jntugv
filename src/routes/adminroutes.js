const express = require('express');
const router = express.Router();
const { createUserAsAdmin } = require('../services/userservice');
const { requireAdmin } = require('../middleware/middleware');

// later you can add admin-auth middleware here
router.post('/create-user', requireAdmin, async (req, res) => {
  try {
    const user = await createUserAsAdmin(req.body);
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
