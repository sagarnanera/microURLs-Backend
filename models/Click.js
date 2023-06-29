const mongoose = require("mongoose");

const ClickSchema = new mongoose.Schema({
    URL_id: {
        type: mongoose.Types.ObjectId,
        ref: "url",
        required: true
    },
    isBotClick: {
        type: Boolean,
        required: true,
        default: false
    },
    clientIP: {
        type: String,
        required: true
    },
    locationInfo: {
        country: {
            type: String,
        },
        region: {
            type: String,
        },
        city: {
            type: String,
        },
        timeZone: {
            type: String
        },
        coordinates: {
            type: [Number],
            index: '2dsphere',
        }
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const Click = mongoose.model("Clicks", ClickSchema);

module.exports = Click;