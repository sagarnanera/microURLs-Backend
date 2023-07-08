const generateUniqueSlug = require("./slugGenerator");
const URLmodel = require('../models/URL');

class SlugAlreadyTakenError extends Error {
    constructor(message) {
        super(message);
        this.name = 'SlugAlreadyTakenError';
    }
}

const saveURL = async (reqSlug, reqURL, reqUserId = null, ipAddress, location) => {
    let customSlug;
    let newRecord;

    if (reqSlug && reqSlug !== "") {
        const existingRecord = await URLmodel.findOne({ Shorten_URL_slug: reqSlug });

        if (existingRecord) {
            throw new SlugAlreadyTakenError("Slug is already taken !!!");
        }

        customSlug = reqSlug;

        newRecord = new URLmodel({
            Original_URL: reqURL,
            Shorten_URL_slug: customSlug,
            userIP: ipAddress,
            locationInfo: location
        });
    } else {
        newRecord = await generateUniqueSlug(reqURL, ipAddress, location);
    }

    newRecord.User = reqUserId;
    await newRecord.save();
    return newRecord;
}

module.exports = { saveURL, SlugAlreadyTakenError };