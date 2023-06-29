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
    }
});

const User = mongoose.model("user", UserSchema);

module.exports = User;