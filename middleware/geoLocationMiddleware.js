const axios = require("axios");

const geoLocationMiddleware = async (req, res, next) => {
    try {

        req.ipAddress = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

        console.log("ip headers >>>>" + req.connection.remoteAddress + "  >> " + req.ipAddress);

        if (req.ipAddress.startsWith("::ffff:")) {
            req.ipAddress = req.ipAddress.slice(7);
        }

        req.ipAddress = req.ipAddress.split(",")[0].trim();

        console.log("client ip : " + req.ipAddress);

        const response = await axios.get(
            // `https://get.geojs.io/v1/ip/geo/${req.ipAddress}.json`,
            `http://ip-api.com/json/${req.ipAddress}?fields=9564159`
        );
        const data = response.data;

        console.log(response.data);

        if (data.status === "success") {

            const location = {
                country: data.country,
                region: data.region,
                city: data.city,
                timeZone: data.timezone,
                coordinates: [
                    data.lon,
                    data.lat
                ]
            };

            req.location = location;

            req.isMobile = data.mobile

        }

        next();

    } catch (error) {
        console.error("error in geolocation middleware....." + error);
        res.status(500).json({
            success: false, msg: "Internal server error...."
        });
        return;
    }
};

module.exports = geoLocationMiddleware;
