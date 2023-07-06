const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    lastLoginIp: {
        type: String,
        required: true
    },
    lastLoggedInTime: {
        type: Date,
        default: Date.now
    },
    registeredOn: {
        type: Date,
        default: Date.now
    },
    resetPasswordToken: {
        type: String,
        default: undefined
    },
    resetPasswordExpires: {
        type: Date,
        default: undefined
    }
});

const User = mongoose.model("user", UserSchema);

module.exports = User;