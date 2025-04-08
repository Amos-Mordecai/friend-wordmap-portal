const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const {
    getAllUsers,
    addUser,
    removeUser,
    addWordInput,
    getWordInputs,
    updateProfilePicture,
    toggleWordMapVisibility,
    getAvailableUsers,
    upload,
    updateWordInput
} = require('../controllers/userController');

// Admin routes
router.get('/', auth, adminAuth, getAllUsers);
router.post('/', auth, adminAuth, addUser);
router.delete('/:userId', auth, adminAuth, removeUser);
router.put('/:userId/wordmap-visibility', auth, adminAuth, toggleWordMapVisibility);

// User routes
router.get('/available', auth, getAvailableUsers);
router.post('/word-input', auth, addWordInput);
router.put('/word-input', auth, updateWordInput);
router.get('/:userId/word-inputs', auth, getWordInputs);
router.put('/profile-picture', auth, upload.single('profilePicture'), updateProfilePicture);

module.exports = router; 