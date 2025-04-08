const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    accessCode: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    profilePicture: {
        type: String,
        default: ''
    },
    wordInputs: [{
        targetUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        word: {
            type: String,
            required: true
        }
    }],
    wordMapVisible: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Create indexes
userSchema.index({ accessCode: 1 });

const User = mongoose.model('User', userSchema);

module.exports = User; 