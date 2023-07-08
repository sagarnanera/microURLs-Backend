const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const logger = require("morgan");
const randomstring = require("randomstring");
const cookieParser = require("cookie-parser");
const passport = require("passport");

//middlewares
const captchaVerify = require("../middleware/captchVerifier");
const geoLocationMiddleware = require("../middleware/geoLocationMiddleware");


// routes
const { redirectUser } = require("../controllers/redirectController");
const authRoute = require("../routes/authRoute");
const urlRoute = require("../routes/urlRoute");
const userRoute = require("../routes/userRoute");
const supportRoute = require("../routes/supportRoute");


const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

var monitor = require('express-status-monitor');
app.use(monitor());

// view engine setup
app.set('view engine', 'ejs');
app.set('views', './view');

app.use(logger(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :response-time ms :res[content-length] ":referrer" ":user-agent"'));

app.use(cookieParser());

// passportJS config
app.use(passport.initialize());
require("../config/passport")(passport);

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}));

app.get("/", geoLocationMiddleware, (req, res) => {

    console.log("user-agent : " + req.get("user-agent"));

    const test_slug = randomstring.generate(8);
    res
        .status(200)
        .json({
            test_slug: test_slug,
            req_ip: req.ipAddress,
            locationInfo: req.location
        });
});

app.use("/api/auth", authRoute);
app.use("/api/user", userRoute);
app.use("/api/url", urlRoute);
app.use("/api/support", supportRoute);
app.get("/:slug", geoLocationMiddleware, redirectUser);

app.use((err, req, res, next) => {
    console.log(err);
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ error: 'Invalid JSON payload' });
    }

    return res.status(500).json({ error: 'Internal Server Error' });
});

module.exports = app;
