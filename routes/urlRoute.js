const express = require('express');
const { AddURL, EditURLslug, deleteURL, getURLs, getURLbyId, addURLprivate } = require('../controllers/urlController');
const authenticateJWT = require('../middleware/authMiddleware');
const geoLocationMiddleware = require('../middleware/geoLocationMiddleware');
const router = express.Router();


router.route("/addURL").post(geoLocationMiddleware, AddURL);

// protected routes - auth required
router.route("/addURLprivate").post(authenticateJWT, geoLocationMiddleware, addURLprivate);
router.route("/editURLslug").post(authenticateJWT, geoLocationMiddleware, EditURLslug);
router.route("/deleteURL").post(authenticateJWT, geoLocationMiddleware, deleteURL);
router.route("/geturls").get(authenticateJWT, geoLocationMiddleware, getURLs);
router.route("/geturl/:id").get(authenticateJWT, geoLocationMiddleware, getURLbyId);


module.exports = router;