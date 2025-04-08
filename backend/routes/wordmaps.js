const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { getWordInputs } = require('../controllers/userController');

// Get word inputs for a user
router.get('/:userId', auth, getWordInputs);

module.exports = router; 