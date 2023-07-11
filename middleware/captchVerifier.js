const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();

const recaptchaKey = process.env.CAPTCHA_KEY;

const captchaVerify = async (req, res, next) => {
    try {
        const { captchaToken } = req.body;

        const CaptchaRes = await axios.post(
            `https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaKey}&response=${captchaToken}`
        );

        if (!CaptchaRes.data.success) {
            console.log("BOT!!!", req.ip);
            res.status(403).json({
                success: false,
                message: "Forbidden!! , captcha verification failed....."
            });
            return;
        }

        next();
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error...." });
        return;
    }
};

module.exports = captchaVerify;
