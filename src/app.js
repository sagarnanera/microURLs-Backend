const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv").config();
const logger = require("morgan");
const randomstring = require("randomstring");
const path = require("path");
const isbot = require("isbot");

//middlewares
const captchaVerify = require("../middleware/captchVerifier");
const getGeoLocation = require("../middleware/geoLocation");

//models
const URL = require("../models/URL");
const Click = require("../models/Click");

const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(logger("dev"));
app.use(cors());

const error404 = path.join(__dirname, '../view/404_error.html');
const redirectError = path.join(__dirname, '../view/redirect_error.html');

console.log(error404);

const hostname = process.env.WEB_HOST;
const port = process.env.PORT;

app.get("/", getGeoLocation, (req, res) => {
    const test_slug = randomstring.generate(8);
    res
        .status(200)
        .json({
            test_slug: test_slug,
            req_ip: req.ipAddress,
            locationInfo: req.location
        });
});

app.post("/add",
    captchaVerify,
    getGeoLocation, async (req, res) => {

        try {

            var customSlug;

            if (req.body.customSlug && req.body.customSlug !== "") {
                customSlug = req.body.customSlug;

                const result = await URL.findOne({ Shorten_URL_slug: customSlug });

                if (result) {
                    console.log(result);
                    res.status(409).json({
                        success: true,
                        msg: "Slug is already taken"
                    });
                    return
                }

            } else {
                customSlug = randomstring.generate(8);
            }

            console.log("Request IP : ", req.ipAddress);

            const result = await URL.findOne({ Original_URL: req.body.URL });

            if (result) {
                res.status(200).json({
                    success: true,
                    Original_URL: result.Original_URL,
                    shorten_URL: process.env.IS_DEV === true
                        ? "http://" + hostname + `:${port}/` + result.Shorten_URL_slug
                        : process.env.DOMAIN_NAME + "/" + result.Shorten_URL_slug
                });
                console.log(result);
            } else {

                const newrecord = new URL({
                    Original_URL: req.body.URL,
                    Shorten_URL_slug: customSlug,
                    userIP: req.ipAddress,
                    locationInfo: req.location
                });

                await newrecord.save();

                res.status(200).json({
                    success: true,
                    Original_URL: newrecord.Original_URL,
                    shorten_URL: process.env.IS_DEV === true
                        ? "http://" + hostname + `:${port}/` + newrecord.Shorten_URL_slug
                        : process.env.DOMAIN_NAME + "/" + newrecord.Shorten_URL_slug
                });
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                msg: "Internal server error",
                error: error.message
            });
        }
    });

// app.post("/add-custom-slug", captchaVerify, async (req, res) => {
//     const { customSlug, URL } = req.body;

//     try {
//         const result = await URL.findOne({ slug: customSlug });

//         if (result) {
//             console.log(result);
//             res.json({
//                 status: 409,
//                 error: "Slug is already taken"
//             });
//         } else {
//             const newrecord = new URL({
//                 Original_URL: URL,
//                 Shorten_URL_slug: customSlug,
//                 clicks: 0
//             });

//             const data = await newrecord.save();

//             if (data) {
//                 res.json({
//                     status: 200,
//                     shorten_URL:
//                         "http://" + hostname + `:${port}/` + data.Shorten_URL_slug
//                 });
//             } else {
//                 res.json({ status: 500, msg: "Internal server error" });
//             }
//         }
//     } catch (error) {
//         console.log("Exception in custom-slug handler : " + error);
//         res.json({ status: 500, msg: "Internal server error" });
//     }
// });

app.get("/:slug",
    getGeoLocation,
    async (req, res) => {
        const userAgent = req.get("user-agent");
        const slug = req.params.slug;

        try {

            // throw new Error(
            //     "redirection error test"
            // );

            const shorten_URL = await URL.findOne({ Shorten_URL_slug: slug });

            if (!shorten_URL) {
                res.status(404).sendFile(error404);
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
            return;
        } catch (error) {
            console.log("error in redirecting : " + error);
            res.status(500).sendFile(redirectError);
        }
    });

module.exports = app;
