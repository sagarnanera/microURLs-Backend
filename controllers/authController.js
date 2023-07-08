const User = require("../models/User");
const { genJWTToken } = require("../services/jwtTokenService");
const { userLoginValidator, userSignupValidator } = require("../validators/authValidator");
const { hashPassword, compareHash } = require("../services/hashPassword");
const sendMail = require("../services/mailService");
const ejs = require("ejs");
const fs = require("fs");
const path = require("path");

const hostName = process.env.IS_DEV === "true" ?
    `http://${process.env.WEB_HOST}:${process.env.PORT}` : process.env.DOMAIN_NAME;

exports.Login = async (req, res) => {
    try {
        console.log(req.body);

        const { error } = userLoginValidator.validate(req.body);

        if (error) {
            return res
                .status(400)
                .json({ success: false, message: error.details[0].message });
        }

        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, errors: "User does not exist" });
        }

        const isMatch = await compareHash(password, user.password);

        if (isMatch) {
            const payload = {
                _id: user._id,
                userName: user.userName
            };

            const options = {
                expires: new Date(
                    Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
                ),
                secure: true,
                httpOnly: true,
                sameSite: "none"
            };

            // Sign token
            const token = genJWTToken(payload);

            // Update the lastLoggedInTime field
            user.lastLoginIp = req.ipAddress;
            user.lastLoggedInTime = Date.now();
            await user.save();

            res.status(200).
                cookie("token", token, options).
                json({
                    success: true,
                    message: "logged in successfully"
                });

        } else {
            return res
                .status(400)
                .json({ success: false, errors: "Invalid Credentials !!!" });
        }

    } catch (error) {

        console.log(error);
        res.status(500).json({ success: false, errors: "Internal server error" });

    }
}

exports.Register = async (req, res) => {
    try {

        console.log(req.body);

        const { error } = userSignupValidator.validate(req.body);

        if (error) {
            return res
                .status(400)
                .json({ success: false, message: error.details[0].message });
        }

        const { userName, email, password } = req.body;

        const user = await User.findOne({ email: email });

        if (user) {
            return res.
                status(400).
                json({ success: false, errors: "Email already exists" });

        } else {

            const hash = await hashPassword(password);

            const newUser = new User({
                userName: userName,
                email: email,
                password: hash
            });

            console.log(newUser);

            const payload = {
                _id: newUser._id,
                userName: newUser.userName
            };

            const options = {
                expires: new Date(
                    Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
                ),
                secure: true,
                httpOnly: true,
                sameSite: "none"
            };

            // Sign token
            const token = genJWTToken(payload);

            // Update the lastLoggedInTime field
            newUser.lastLoginIp = req.ipAddress;
            newUser.lastLoggedInTime = Date.now();
            await newUser.save();


            const verificationToken = genJWTToken({ email: newUser.email }, "verify-Email");
            const verificationLink = `${hostName}/api/auth/verify-email/${verificationToken}`;

            const template = fs.readFileSync(
                path.join(__dirname, "../view/email-verification.ejs"),
                "utf8");

            const html = ejs.render(template, { verificationLink });

            try {
                await sendMail(newUser.email, "Email verification", "", html);
            } catch (error) {
                console.error("Error sending email:", error);
                return res.
                    status(500).
                    json({
                        success: false,
                        message: "Error sending Password reset email! please try later!!!"
                    });
            }

            res.status(200).
                cookie("token", token, options).
                json({
                    success: true,
                    message: "Registered in successfully and An Email verification link has been send to you on mail !!! please verify your email !!!"
                });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, errors: "Internal server error" });

    }
}

exports.LogOut = async (req, res) => {

    try {
        console.log(req.user);
        res.clearCookie("token");
        res.status(200).send({ success: "true", message: "Successfully Logged Out" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal Server Error." });
    }
}
