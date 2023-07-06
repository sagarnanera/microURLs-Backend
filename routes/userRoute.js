const express = require('express');
const { GetUser, DeleteUser, ResetPass, EditUser } = require('../controllers/userController');
const authenticateJWT = require('../middleware/authMiddleware');
const geoLocationMiddleware = require('../middleware/geoLocationMiddleware');
const router = express.Router();


router.route("/getUser").get(authenticateJWT, geoLocationMiddleware, GetUser);
router.route("/updateUser").post(authenticateJWT, geoLocationMiddleware, EditUser);
router.route("/deleteUser").post(authenticateJWT, geoLocationMiddleware, DeleteUser);
router.route("/update-password").post(authenticateJWT, geoLocationMiddleware, ResetPass);

module.exports = router;