const User = require('../models/User');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
    try {
        const { accessCode } = req.body;

        // Find user by access code
        const user = await User.findOne({ accessCode });
        if (!user) {
            return res.status(401).json({ message: 'Invalid access code' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, isAdmin: user.isAdmin },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                isAdmin: user.isAdmin,
                profilePicture: user.profilePicture
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    login
}; 