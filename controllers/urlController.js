const URLmodel = require("../models/URL");
const { urlValidator, urlValidatorPrivate, editURLValidator, deleteURLValidator } = require("../validators/urlValidator");
const { URL } = require('url');
const { saveURL, SlugAlreadyTakenError } = require("../services/saveURLs");

const hostname = process.env.WEB_HOST;
const port = process.env.PORT;
const DomainName = process.env.DOMAIN_NAME;

exports.AddURL = async (req, res) => {

    try {
        const { error } = urlValidator.validate(req.body);

        if (error) {
            return res
                .status(400)
                .json({ success: false, message: error.details[0].message });
        }

        const { Original_URL: reqURL, customSlug: reqSlug } = req.body;

        console.log("reqHost : " + new URL(reqURL).hostname);
        console.log("serverHost : " + new URL(DomainName).hostname);

        if (new URL(reqURL).hostname === new URL(DomainName).hostname) {
            return res
                .status(400)
                .json({ success: false, message: "this domain is banned...!!!" });
        }

        const newRecord = await saveURL(reqSlug, reqURL, null, req.ipAddress, req.location);

        res.status(200).json({
            success: true,
            Original_URL: newRecord.Original_URL,
            Shorten_URL: process.env.IS_DEV === "true"
                ? "http://" + hostname + `:${port}/` + newRecord.Shorten_URL_slug
                : DomainName + "/" + newRecord.Shorten_URL_slug
        });
    } catch (error) {
        console.log(error);
        if (error instanceof SlugAlreadyTakenError)
            return res.status(409).json({
                success: false,
                msg: error.message
            });

        res.status(500).json({
            success: false,
            msg: "Internal server error",
            error: error.message
        });
    }
}

exports.addURLprivate = async (req, res) => {

    try {
        const { error } = urlValidatorPrivate.validate(req.body);

        if (error) {
            return res
                .status(400)
                .json({ success: false, message: error.details[0].message });
        }

        const { Original_URL: reqURL, customSlug: reqSlug } = req.body;

        if (new URL(reqURL).hostname === new URL(DomainName).hostname) {
            return res
                .status(400)
                .json({ success: false, message: "this domain is banned...!!!" });
        }

        const newRecord = await saveURL(reqSlug, reqURL, req.user._id, req.ipAddress, req.location);

        console.log("Request IP : ", req.ipAddress);

        res.status(200).json({
            success: true,
            Original_URL: newRecord.Original_URL,
            Shorten_URL: process.env.IS_DEV === "true"
                ? "http://" + hostname + `:${port}/` + newRecord.Shorten_URL_slug
                : DomainName + "/" + newRecord.Shorten_URL_slug
        });

    } catch (error) {
        console.log(error);
        if (error instanceof SlugAlreadyTakenError)
            return res.status(409).json({
                success: false,
                msg: error.message
            });
        res.status(500).json({
            success: false,
            msg: "Internal server error",
            error: error.message
        });
    }
}

exports.EditURLslug = async (req, res) => {
    try {
        const { error } = editURLValidator.validate(req.body);

        if (error) {
            return res
                .status(400)
                .json({ success: false, message: error.details[0].message });
        }

        const { id, updatedSlug } = req.body;

        const existingRecord = await URLmodel.findOne({
            _id: id,
            User: req.user._id
        }).select("_id Original_URL Shorten_URL_slug");

        if (!existingRecord) {
            return res.status(404).json({ success: false, msg: "URL not found" });
        }

        const isSlugTaken = await URLmodel.findOne({ Shorten_URL_slug: updatedSlug });

        console.log(isSlugTaken);
        if (isSlugTaken) {
            throw new SlugAlreadyTakenError("Slug is already taken !!!")
        }

        existingRecord.Shorten_URL_slug = updatedSlug;
        existingRecord.lastUpdatedOn = new Date();
        await existingRecord.save();

        res.status(200).json({
            success: true,
            msg: "URL slug updated successfully",
            Updated_URL: existingRecord,
        });
    } catch (error) {
        console.log(error);
        if (error instanceof SlugAlreadyTakenError)
            return res.status(409).json({
                success: false,
                msg: error.message
            });
        res.status(500).json({
            success: false,
            msg: "Internal server error",
            error: error.message,
        });
    }
};

exports.deleteURL = async (req, res) => {
    try {
        const { error } = deleteURLValidator.validate(req.body);

        if (error) {
            return res
                .status(400)
                .json({ success: false, message: error.details[0].message });
        }

        const { id } = req.body;

        const deletedURL = await URLmodel.findOneAndDelete({ _id: id, User: req.user._id });

        if (!deletedURL) {
            return res.status(404).json({ success: false, msg: "URL not found" });
        }

        res.status(200).json({
            success: true,
            msg: "URL deleted successfully",
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            msg: "Internal server error",
            error: error.message,
        });
    }
};

exports.getURLs = async (req, res) => {
    try {

        const userId = req.user._id;

        console.log(userId);

        const urls = await URLmodel.find({ User: userId }).select("_id Original_URL Shorten_URL_slug");

        if (urls.length === 0) {
            return res.status(404)
                .json({
                    success: false,
                    msg: "No URLs found"
                })
        }

        res.status(200)
            .json({
                success: true,
                msg: "URLs retrieved successfully",
                URLs: urls,
            });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            msg: "Internal server error",
            error: error.message,
        });
    }
};

exports.getURLbyId = async (req, res) => {
    try {

        const { id } = req.params;

        const url = await URLmodel.findOne({
            _id: id,
            User: req.user._id
        }).select("_id Original_URL Shorten_URL_slug");

        if (!url) {
            return res.status(404).json({ success: false, msg: "URL not found" });
        }

        res.status(200).json({
            success: true,
            msg: "URL retrieved successfully",
            URL: url,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            msg: "Internal server error",
            error: error.message,
        });
    }
};


