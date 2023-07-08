const express = require('express');
const { AddURL, EditURLslug, deleteURL, getURLs, getURLbyId, addURLprivate, getDatabyId, getData } = require('../controllers/urlController');
const authenticateJWT = require('../middleware/authMiddleware');
const geoLocationMiddleware = require('../middleware/geoLocationMiddleware');
const captchaVerify = require('../middleware/captchVerifier');
const router = express.Router();


router.route("/addURL").post(captchaVerify, geoLocationMiddleware, AddURL);

// protected routes - auth required
router.route("/addURLprivate").post(authenticateJWT, geoLocationMiddleware, addURLprivate);
router.route("/editURLslug").post(authenticateJWT, geoLocationMiddleware, EditURLslug);
router.route("/deleteURL").post(authenticateJWT, geoLocationMiddleware, deleteURL);
router.route("/geturls").get(authenticateJWT, geoLocationMiddleware, getURLs);
router.route("/geturl/:id").get(authenticateJWT, geoLocationMiddleware, getURLbyId);

router.route("/getData").get(authenticateJWT, getData);
router.route("/getData/:id").get(authenticateJWT, getDatabyId);


module.exports = router;