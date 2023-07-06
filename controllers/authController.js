const User = require("../models/User");
const { genJWTToken, verifyJWTToken } = require("../services/jwtTokenService");
const { userLoginValidator, userSignupValidator, passwordValidator, resetPassValidator, emailValidator, tokenValidator } = require("../validators/authValidator");
const { hashPassword, compareHash } = require("../services/hashPassword");
const sendMail = require("../services/mailService");
const crypto = require("crypto");
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

exports.ResendVerificationMail = async (req, res) => {

    try {

        const user = await User.findById(req.user._id).select("email isEmailVerified");

        if (user.isEmailVerified) {
            return res.status(400).
                json({
                    success: false,
                    message: "Email is already verified"
                });
        }

        const verificationToken = genJWTToken({ email: user.email }, "verify-Email");
        const verificationLink = `${hostName}/api/auth/verify-email/${verificationToken}`;

        const template = fs.readFileSync(
            path.join(__dirname, "../view/email-verification.ejs"),
            "utf8");

        const html = ejs.render(template, { verificationLink });

        try {
            await sendMail(user.email, "Email verification", "", html);
        } catch (error) {
            console.error("Error sending email:", error);
            return res.
                status(500).
                json({
                    success: false,
                    message: "Error sending Email verification mail ! please try later!!!"
                });
        }

        res.status(200).
            json({
                success: true,
                message: "An Email verification link has been send to your mail !!! please verify your email !!!"
            });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal Server Error." });
    }
}

exports.VerifyEmail = async (req, res) => {

    try {
        const { token } = req.params;

        const { email } = verifyJWTToken(token);

        const user = await User.findOne({ email: email });

        if (!user) {
            return res.render('email-verification-response.ejs', {
                success: false,
                errorMessage: 'User Not Found !!!'
            });
        }
        if (user.isEmailVerified) {
            return res.render('email-verification-response.ejs', {
                success: false,
                errorMessage: "Email is already verified"
            });
        }

        user.isEmailVerified = true;
        user.save();

        return res.render('email-verification-response.ejs', {
            success: true
        });
    } catch (error) {
        console.log(error);
        if (error.name === "TokenExpiredError") {
            return res.render('email-verification-response.ejs', {
                success: false,
                errorMessage: "Token expired !!! please login to your account and try resend verification link feature !!!"
            });
        }

        res.render('email-verification-response.ejs', {
            success: false,
            errorMessage: 'Internal Server Error.'
        });
    }
}

exports.ForgotPassword = async (req, res) => {

    try {

        const { error } = emailValidator.validate(req.body);

        if (error) {
            return res
                .status(400)
                .json({ success: false, error: error.details[0].message });
        }

        const { email } = req.body;

        // Find the user by their email address
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        // Generate a unique token for password reset
        const token = crypto.randomBytes(32).toString("hex");

        // Save the token and its associated user in the database
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // Token expires in 1 hour
        await user.save();

        // Send the password reset email
        const template = fs.readFileSync(
            path.join(__dirname, "../view/password-reset-email.ejs"),
            "utf8");
        const subject = "Password Reset";
        const resetLink = `${hostName}/api/auth/reset-password/${token}`
        console.log(resetLink);

        // const html = `<p>You have requested to reset your password. Click
        // <a href="http://${hostName}/api/auth/reset-password/${token}">here</a> to reset your password.</p>`;

        const html = ejs.render(template, { ipAddress: req.ipAddress, location: req.location, resetLink });

        try {
            await sendMail(user.email, subject, "", html);
        } catch (error) {
            console.error("Error sending email:", error);
            return res.
                status(500).
                json({
                    success: false,
                    message: "Error sending Password reset email! please try later!!!"
                });
        }

        res.status(200).json({ success: true, message: "Password reset email sent." });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal Server Error." });
    }
}

exports.ResetPassword = async (req, res) => {

    try {

        const { error } = resetPassValidator.validate(req.body);

        if (error) {
            return res
                .status(400)
                .json({ success: false, message: error.details[0].message });
        }

        const { token, password } = req.body;


        // Find the user with the matching reset token and check if it's still valid
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }, // Check if token is not expired
        });

        if (!user) {
            return res.
                status(400).
                json({ success: false, message: "Invalid or expired token." });
        }

        // Update the user's password and reset token fields
        user.password = await hashPassword(password);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        return res.status(200).json({ success: true, message: "Password reset successful." });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal Server Error." });
    }


}

exports.ResetPasswordPage = async (req, res) => {

    try {

        const { error } = tokenValidator.validate(req.params);

        if (error) {
            return res
                .status(400)
                .json({ success: false, message: error.details[0].message });
        }

        const token = req.params.token;

        res.render('reset-password-page', { token });


    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal Server Error." });
    }


}