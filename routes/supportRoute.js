const express = require('express');
const { ForgotPassword, ResetPassword, ResetPasswordPage, VerifyEmail, ResendVerificationMail, ContactUS } = require("../controllers/supportController");
const authenticateJWT = require('../middleware/authMiddleware');
const captchaVerify = require('../middleware/captchVerifier');
const geoLocationMiddleware = require('../middleware/geoLocationMiddleware');
const router = express.Router();


router.route("/forgot-password").post(geoLocationMiddleware, ForgotPassword);
router.route("/reset-password/:token").get(geoLocationMiddleware, ResetPasswordPage);
router.route("/reset-password").post(geoLocationMiddleware, ResetPassword);
router.route("/verify-email/:token").get(geoLocationMiddleware, VerifyEmail);
router.route("/resend-verification-email").post(authenticateJWT, geoLocationMiddleware, ResendVerificationMail);

router.route("/contact-us").post(geoLocationMiddleware, ContactUS);

module.exports = router;