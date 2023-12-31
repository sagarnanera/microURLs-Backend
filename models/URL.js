const mongoose = require("mongoose");

const Urlschema = new mongoose.Schema({

    User: {
        type: mongoose.Types.ObjectId,
        ref: 'user'
    },
    Original_URL: {
        type: String,
        required: true
    },
    Shorten_URL_slug: {
        type: String,
        required: true,
        unique: true
    },
    userIP: {
        type: String,
        required: true
    },
    locationInfo: {
        country: {
            type: String
        },
        region: {
            type: String
        },
        city: {
            type: String
        },
        coordinates: {
            type: [Number],
            index: "2dsphere"
        }
    },
    createdOn: {
        type: Date,
        default: Date.now
    },
    lastUpdatedOn: {
        type: Date,
        default: null
    }
});

const URL = mongoose.model("url", Urlschema);

module.exports = URL;
