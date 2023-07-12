const express = require('express');
const { AddURL, EditURLslug, deleteURL, getURLs, getURLbyId, addURLprivate, getDatabyId, getData, getTotalClicks } = require('../controllers/urlController');
const authenticateJWT = require('../middleware/authMiddleware');
const geoLocationMiddleware = require('../middleware/geoLocationMiddleware');
const captchaVerify = require('../middleware/captchVerifier');
const router = express.Router();


router.route("/addURL").post(captchaVerify, geoLocationMiddleware, AddURL);
router.route("/getClicks").post(captchaVerify, geoLocationMiddleware, getTotalClicks);

// protected routes - auth required
router.route("/addURLprivate").post(authenticateJWT, geoLocationMiddleware, addURLprivate);
router.route("/editURLslug").post(authenticateJWT, geoLocationMiddleware, EditURLslug);
router.route("/deleteURL").post(authenticateJWT, geoLocationMiddleware, deleteURL);
router.route("/geturls").get(authenticateJWT, geoLocationMiddleware, getURLs);
router.route("/geturl/:id").get(authenticateJWT, geoLocationMiddleware, getURLbyId);

router.route("/getData").get(authenticateJWT, geoLocationMiddleware, getData);
router.route("/getData/:id").get(authenticateJWT, geoLocationMiddleware, getDatabyId);


module.exports = router;