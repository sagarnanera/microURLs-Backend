const axios = require("axios");

const getGeoLocation = async (req, res, next) => {
    try {
        req.ipAddress = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

        console.log("headers >>>>" + req.connection.remoteAddress + "  >> " + req.ipAddress);

        if (req.ipAddress.startsWith("::ffff:")) {
            req.ipAddress = req.ipAddress.slice(7);
        }

        req.ipAddress.split(",")[0].trim();

        console.log("client ip : " + req.ipAddress);

        const response = await axios.get(
            `https://get.geojs.io/v1/ip/geo/${req.ipAddress}.json`
        );
        const data = response.data;

        // console.log(response.data);  

        const location = {
            country: data.country,
            region: data.region,
            city: data.city,
            timeZone: data.timezone,
            coordinates: [
                data.longitude !== "nil" ? data.longitude : 0,
                data.latitude !== "nil" ? data.latitude : 0
            ]
        };

        req.location = location;

        next();
    } catch (error) {
        console.error("error in geolocation middleware.....");
        res.status(500).json({
            success: false, msg: "Internal server error...."
        });
        return;
    }
};

module.exports = getGeoLocation;
