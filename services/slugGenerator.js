// slugGenerator.js

const randomstring = require("randomstring");
const URL = require("../models/URL");

const generateUniqueSlug = async (originalURL, userIP, locationInfo) => {
    let customSlug;
    let isUnique = false;

    while (!isUnique) {
        customSlug = randomstring.generate(6);

        try {
            const createdURL = await URL.create({
                Original_URL: originalURL,
                Shorten_URL_slug: customSlug,
                userIP: userIP,
                locationInfo: locationInfo
            });
            isUnique = true; // If no error is thrown, the slug is unique
            return createdURL; // Return the created URL object
        } catch (error) {
            if (error.code !== 11000) {
                throw error; // Rethrow the error if it's not a duplicate key error
            }
        }
    }
};

module.exports = generateUniqueSlug;
