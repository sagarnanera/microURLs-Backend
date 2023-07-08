const URLmodel = require("../models/URL");
const ClickModel = require("../models/Click");
const { urlValidator, urlValidatorPrivate, editURLValidator, deleteURLValidator } = require("../validators/urlValidator");
const { URL } = require('url');
const { saveURL, SlugAlreadyTakenError } = require("../services/saveURLs");
const { default: mongoose } = require("mongoose");

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


exports.getData = async (req, res) => {
    try {

        const { user } = req;

        const totalUrls = await URLmodel.countDocuments({ User: user._id });

        if (totalUrls.length === 0) {
            return res.status(404).json({ success: false, msg: "No URLs found !!!!" });

        }

        const pipeline = [
            {
                $match: {
                    User: mongoose.Types.ObjectId(user._id)
                }
            },
            {
                $lookup: {
                    from: "clicks",
                    localField: "_id",
                    foreignField: "URL_id",
                    as: "clicks"
                }
            },
            {
                $unwind: "$clicks"
            },
            {
                $facet: {
                    // totalUrls: [
                    //     {
                    //         $group: {
                    //             _id: "$_id",
                    //             count: { $sum: 1 }
                    //         }
                    //     }
                    // ],
                    totalClicks: [
                        {
                            $count: "count"
                        }
                    ],
                    clicksDayWise: [
                        {
                            $group: {
                                _id: {
                                    $dateToString: {
                                        format: "%Y-%m-%d",
                                        date: "$clicks.date"
                                    }
                                },
                                count: { $sum: 1 },
                                botClicksDayWise: {
                                    $sum: {
                                        $cond: [
                                            { $eq: ["$clicks.isBotClick", true] },
                                            1,
                                            0
                                        ]
                                    }
                                },
                                humanClicksDayWise: {
                                    $sum: {
                                        $cond: [
                                            { $eq: ["$clicks.isBotClick", false] },
                                            1,
                                            0
                                        ]
                                    }
                                }
                            }
                        }
                    ],
                    clicksLocationWise: [
                        {
                            $group: {
                                _id: "$clicks.locationInfo.country",
                                count: { $sum: 1 },
                                botClicksLocationWise: {
                                    $sum: {
                                        $cond: [
                                            { $eq: ["$clicks.isBotClick", true] },
                                            1,
                                            0
                                        ]
                                    }
                                },
                                humanClicksLocationWise: {
                                    $sum: {
                                        $cond: [
                                            { $eq: ["$clicks.isBotClick", false] },
                                            1,
                                            0
                                        ]
                                    }
                                }
                            }
                        }
                    ],
                    userURLsWithMostClicks: [
                        {
                            $group: {
                                _id: "$clicks.URL_id",
                                count: { $sum: 1 }
                            }
                        },
                        { $sort: { count: -1 } },
                        { $limit: 5 }
                    ],
                    totalBotClicks: [
                        {
                            $match: { "clicks.isBotClick": true }
                        },
                        {
                            $group: {
                                _id: null,
                                count: { $sum: 1 }
                            }
                        }
                    ],
                    totalHumanClicks: [
                        {
                            $match: { "clicks.isBotClick": false }
                        },
                        {
                            $group: {
                                _id: null,
                                count: { $sum: 1 }
                            }
                        }
                    ]
                }
            },
            {
                $project: {
                    _id: 1,
                    totalClicks: {
                        $ifNull: [{ $arrayElemAt: ["$totalClicks.count", 0] }, 0]
                    },
                    clicksDayWise: 1,
                    clicksLocationWise: 1,
                    userURLsWithMostClicks: 1,
                    totalBotClicks: {
                        $ifNull: [{ $arrayElemAt: ["$totalBotClicks.count", 0] }, 0]
                    },
                    totalHumanClicks: {
                        $ifNull: [{ $arrayElemAt: ["$totalHumanClicks.count", 0] }, 0]
                    },
                }
            }
        ];


        const result = await URLmodel.aggregate(pipeline);
        result[0].totalUrls = totalUrls;

        // console.log(result);

        res.status(200)
            .json({
                success: true,
                msg: "URLs data retrieved successfully",
                URLs_data: result[0],
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

exports.getDatabyId = async (req, res) => {
    try {

        const { id } = req.params;
        const userId = req.user._id;

        const url = await URLmodel.findOne({ _id: id, User: userId });

        if (!url) {
            return res.status(404).json({ success: false, msg: "URL not found" });
        }

        const pipeline = [
            {
                $match: {
                    _id: mongoose.Types.ObjectId(id),
                    User: mongoose.Types.ObjectId(userId)
                }
            },
            {
                $lookup: {
                    from: "clicks",
                    localField: "_id",
                    foreignField: "URL_id",
                    as: "clicks"
                }
            },
            {
                $unwind: "$clicks"
            },
            {
                $facet: {
                    totalClicks: [
                        { $count: "count" }
                    ],
                    totalBotClicks: [
                        { $match: { "clicks.isBotClick": true } },
                        { $count: "count" }
                    ],
                    totalHumanClicks: [
                        { $match: { "clicks.isBotClick": false } },
                        { $count: "count" }
                    ],
                    clicksDayWise: [
                        {
                            $group: {
                                _id: { $dateToString: { format: "%Y-%m-%d", date: "$clicks.date" } },
                                count: { $sum: 1 },
                                botClicksDayWise: {
                                    $sum: {
                                        $cond: [
                                            { $eq: ["$clicks.isBotClick", true] },
                                            1,
                                            0
                                        ]
                                    }
                                },
                                humanClicksDayWise: {
                                    $sum: {
                                        $cond: [
                                            { $eq: ["$clicks.isBotClick", false] },
                                            1,
                                            0
                                        ]
                                    }
                                }
                            }
                        }
                    ],
                    clicksLocationWise: [
                        {
                            $group: {
                                _id: "$clicks.locationInfo.country",
                                count: { $sum: 1 },
                                botClicksLocationWise: {
                                    $sum: {
                                        $cond: [
                                            { $eq: ["$clicks.isBotClick", true] },
                                            1,
                                            0
                                        ]
                                    }
                                },
                                humanClicksLocationWise: {
                                    $sum: {
                                        $cond: [
                                            { $eq: ["$clicks.isBotClick", false] },
                                            1,
                                            0
                                        ]
                                    }
                                }
                            }
                        }
                    ],
                    urlId: [
                        {
                            $project: {
                                _id: 1
                            }
                        }
                    ],
                    locationInfo: [
                        {
                            $project: {
                                _id: "$clicks._id",
                                clickLocation: "$clicks.locationInfo"
                            }
                        }
                    ]
                }
            },
            {
                $project: {
                    urlId: { $arrayElemAt: ["$urlId._id", 0] },
                    totalClicks: {
                        $ifNull: [{ $arrayElemAt: ["$totalClicks.count", 0] }, 0]
                    },
                    totalBotClicks: {
                        $ifNull: [{ $arrayElemAt: ["$totalBotClicks.count", 0] }, 0]
                    },
                    totalHumanClicks: {
                        $ifNull: [{ $arrayElemAt: ["$totalHumanClicks.count", 0] }, 0]
                    },
                    clicksDayWise: 1,
                    clicksLocationWise: 1,
                    locationInfo: 1
                }
            }
        ];


        const result = await URLmodel.aggregate(pipeline);

        // console.log(result);

        if (!result[0].totalClicks) {
            return res.status(404).json({ success: false, msg: "No data found for the URL" });
        }

        res.status(200)
            .json({
                success: true,
                msg: "URL data retrieved successfully",
                URL_data: result[0]
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