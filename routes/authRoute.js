const express = require('express');
const { Login, LogOut, Register, ForgotPassword, ResetPassword, ResetPasswordPage, VerifyEmail, ResendVerificationMail } = require("../controllers/authController");
const authenticateJWT = require('../middleware/authMiddleware');
const captchaVerify = require('../middleware/captchVerifier');
const geoLocationMiddleware = require('../middleware/geoLocationMiddleware');
const router = express.Router();


// router.route("/login").post(captchaVerify, geoLocationMiddleware, Login);
// router.route("/register").post(captchaVerify, geoLocationMiddleware, Register);

// for testing only
router.route("/register").post(geoLocationMiddleware, Register);
router.route("/login").post(geoLocationMiddleware, Login);

router.route("/forgot-password").post(geoLocationMiddleware, ForgotPassword);
router.route("/reset-password/:token").get(geoLocationMiddleware, ResetPasswordPage);
router.route("/reset-password").post(geoLocationMiddleware, ResetPassword);
router.route("/verify-email/:token").get(geoLocationMiddleware, VerifyEmail);

// protected routes
router.route("/logout").post(authenticateJWT, LogOut);
router.route("/resend-verification-email").post(authenticateJWT, geoLocationMiddleware, ResendVerificationMail);

module.exports = router;