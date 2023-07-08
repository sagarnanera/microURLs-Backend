const express = require('express');
const { Login, LogOut, Register } = require("../controllers/authController");
const authenticateJWT = require('../middleware/authMiddleware');
const captchaVerify = require('../middleware/captchVerifier');
const geoLocationMiddleware = require('../middleware/geoLocationMiddleware');
const router = express.Router();


// router.route("/login").post(captchaVerify, geoLocationMiddleware, Login);
// router.route("/register").post(captchaVerify, geoLocationMiddleware, Register);

// for testing only
router.route("/register").post(geoLocationMiddleware, Register);
router.route("/login").post(geoLocationMiddleware, Login);

// protected routes
router.route("/logout").post(authenticateJWT, LogOut);


module.exports = router;