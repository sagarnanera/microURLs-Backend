const isbot = require("isbot");
const URL = require("../models/URL");
const Click = require("../models/Click");
const path = require('path');

exports.redirectUser = async (req, res) => {
    const userAgent = req.get("user-agent");
    const slug = req.params.slug;

    try {
        const shorten_URL = await URL.findOne({ Shorten_URL_slug: slug });

        if (!shorten_URL) {
            res.status(404).render("404-error-page");
            return;
        }

        const Original_URL = shorten_URL.Original_URL;

        console.log("is bot.." + isbot(userAgent));

        const newClick = new Click({
            URL_id: shorten_URL._id,
            isBotClick: isbot(userAgent),
            clientIP: req.ipAddress,
            locationInfo: req.location
        });

        newClick.save();
        res.redirect(Original_URL);  
        // res.render("redirect-error-page", { Original_URL });
        return;
    } catch (error) {
        console.log("error in redirecting : " + error);
        res.status(500).render("redirect-error-page", { Original_URL: "" });
    }
}