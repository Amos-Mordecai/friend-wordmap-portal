const User = require('../models/User');
const multer = require('multer');
const path = require('path');

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Add this at the top of the file with other global variables
let isMapFeatureEnabled = true;

// Get all users (admin only)
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}, '-accessCode')
            .populate('wordInputs.targetUser', '_id name profilePicture');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users' });
    }
};

// Add new user (admin only)
const addUser = async (req, res) => {
    try {
        const { name, accessCode } = req.body;
        const user = new User({ name, accessCode });
        await user.save();
        res.status(201).json({ message: 'User added successfully', user });
    } catch (error) {
        res.status(400).json({ message: 'Error adding user' });
    }
};

// Remove user (admin only)
const removeUser = async (req, res) => {
    try {
        const { userId } = req.params;
        await User.findByIdAndDelete(userId);
        res.json({ message: 'User removed successfully' });
    } catch (error) {
        res.status(400).json({ message: 'Error removing user' });
    }
};

// Add word input for a user
const addWordInput = async (req, res) => {
    try {
        const { targetUserId, word } = req.body;
        const userId = req.user._id;

        // Validate target user exists
        const targetUser = await User.findById(targetUserId);
        if (!targetUser) {
            return res.status(404).json({ message: 'Target user not found' });
        }

        // Check if word input already exists
        const user = await User.findById(userId);
        const existingWordInput = user.wordInputs.find(input => 
            input.targetUser.toString() === targetUserId
        );

        if (existingWordInput) {
            // Update existing word input
            existingWordInput.word = word;
            await user.save();
        } else {
            // Add new word input
            user.wordInputs.push({
                targetUser: targetUserId,
                word
            });
            await user.save();
        }

        // Get the updated user with populated data
        const updatedUser = await User.findById(userId)
            .populate('wordInputs.targetUser', '_id name profilePicture');

        // Log the word input details for debugging
        console.log('Word input added/updated:', {
            userId: user._id,
            userName: user.name,
            targetUserId: targetUserId,
            targetUserName: targetUser.name,
            word: word
        });

        res.json({ 
            message: existingWordInput ? 'Word input updated successfully' : 'Word input added successfully',
            user: updatedUser
        });
    } catch (error) {
        console.error('Error in addWordInput:', error);
        res.status(400).json({ message: 'Error managing word input', error: error.message });
    }
};

// Get word inputs for a user
const getWordInputs = async (req, res) => {
    try {
        const { userId } = req.params;
        console.log('Getting word inputs for user:', userId);
        
        // Find all users who have submitted words for this target user
        const users = await User.find({
            'wordInputs.targetUser': userId
        }).populate('wordInputs.targetUser', '_id name profilePicture');

        console.log('Found users with word inputs:', users.map(u => u.name));

        // Extract all word inputs where this user is the target
        const allWordInputs = users.reduce((inputs, user) => {
            const userInputs = user.wordInputs
                .filter(input => {
                    if (!input || !input.targetUser) return false;
                    const targetId = typeof input.targetUser === 'string' 
                        ? input.targetUser 
                        : input.targetUser._id;
                    return targetId.toString() === userId;
                })
                .map(input => ({
                    ...input.toObject(),
                    submittedBy: user.name
                }));
            return [...inputs, ...userInputs];
        }, []);

        console.log('Processed word inputs:', {
            userId,
            wordCount: allWordInputs.length,
            words: allWordInputs.map(input => input.word)
        });

        res.json(allWordInputs);
    } catch (error) {
        console.error('Error in getWordInputs:', error);
        res.status(500).json({ message: 'Error fetching word inputs' });
    }
};

// Update profile picture
const updateProfilePicture = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const userId = req.user._id;
        const profilePictureUrl = `/uploads/${req.file.filename}`;
        
        console.log('Updating profile picture for user:', userId);
        console.log('New profile picture URL:', profilePictureUrl);

        const user = await User.findByIdAndUpdate(
            userId,
            { profilePicture: profilePictureUrl },
            { new: true }
        ).populate('wordInputs.targetUser', '_id name profilePicture');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        console.log('User updated successfully:', user);
        res.json({ 
            message: 'Profile picture updated successfully',
            user: user
        });
    } catch (error) {
        console.error('Error in updateProfilePicture:', error);
        res.status(500).json({ message: 'Error updating profile picture' });
    }
};

// Toggle word map visibility (admin only)
const toggleWordMapVisibility = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.wordMapVisible = !user.wordMapVisible;
        await user.save();

        res.json({ message: 'Word map visibility updated successfully' });
    } catch (error) {
        res.status(400).json({ message: 'Error updating word map visibility' });
    }
};

// Get available users for the current user
const getAvailableUsers = async (req, res) => {
    try {
        const currentUserId = req.user._id;
        
        // First get the current user with complete data
        const currentUser = await User.findById(currentUserId)
            .populate('wordInputs.targetUser', '_id name profilePicture');
        
        // Then get all other users
        const otherUsers = await User.find({
            _id: { $ne: currentUserId }
        }, '-accessCode')
        .populate('wordInputs.targetUser', '_id name profilePicture');

        // Combine current user with other users
        const allUsers = [currentUser, ...otherUsers];

        res.json(allUsers);
    } catch (error) {
        console.error('Error in getAvailableUsers:', error);
        res.status(500).json({ message: 'Error fetching available users' });
    }
};

// Update word input for a user
const updateWordInput = async (req, res) => {
    try {
        const { targetUserId, word } = req.body;
        const userId = req.user._id;

        // Find and update the existing word input
        const user = await User.findOneAndUpdate(
            {
                _id: userId,
                'wordInputs.targetUser': targetUserId
            },
            {
                $set: {
                    'wordInputs.$.word': word
                }
            },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: 'Word input not found' });
        }

        res.json({ message: 'Word input updated successfully' });
    } catch (error) {
        console.error('Error updating word input:', error);
        res.status(400).json({ message: 'Error updating word input' });
    }
};

// Add these new functions before the exports
const toggleMapFeature = async (req, res) => {
    try {
        isMapFeatureEnabled = !isMapFeatureEnabled;
        res.json({ success: true, isEnabled: isMapFeatureEnabled });
    } catch (error) {
        console.error('Error toggling map feature:', error);
        res.status(500).json({ success: false, error: 'Failed to toggle map feature' });
    }
};

const getMapFeatureStatus = async (req, res) => {
    try {
        res.json({ success: true, isEnabled: isMapFeatureEnabled });
    } catch (error) {
        console.error('Error getting map feature status:', error);
        res.status(500).json({ success: false, error: 'Failed to get map feature status' });
    }
};

// Add these to the exports
module.exports = {
    getAllUsers,
    addUser,
    removeUser,
    addWordInput,
    getWordInputs,
    updateProfilePicture,
    toggleWordMapVisibility,
    getAvailableUsers,
    updateWordInput,
    upload,
    toggleMapFeature,
    getMapFeatureStatus
}; 