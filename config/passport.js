const JwtStrategy = require("passport-jwt").Strategy;
const User = require("../models/User");

const opts = {};

opts.jwtFromRequest = (req) => {
    var token = null;
    if (req && req.cookies['token']) {
        token = req.cookies['token'];
    }
    return token;
};

opts.secretOrKey = process.env.JWT_SEC;

module.exports = passport => {

    passport.use(
        new JwtStrategy(opts, (jwt_payload, done) => {
            User.findById(jwt_payload._id).select("-password")
                .then(user => {
                    if (user) {
                        return done(null, user);
                    }
                    return done(null, false);
                })
                .catch(err => {
                    console.log(err);
                    return done(err, false);
                });
        })
    );

    // passport.use(
    //     new GoogleStrategy(
    //         {
    //             clientID: GOOGLE_CLIENT_ID,
    //             clientSecret: GOOGLE_CLIENT_SECRET,
    //             callbackURL: "/auth/google/callback",
    //         },
    //         (accessToken, refreshToken, profile, done) => {
    //             User.findOne({ googleId: profile.id })
    //                 .then((existingUser) => {
    //                     if (existingUser) {
    //                         return done(null, existingUser);
    //                     } else {
    //                         const newUser = new User({
    //                             googleId: profile.id,
    //                             email: profile.emails[0].value,
    //                             // Add any additional user fields as needed
    //                         });
    //                         newUser
    //                             .save()
    //                             .then((user) => {
    //                                 done(null, user);
    //                             })
    //                             .catch((err) => {
    //                                 console.log(err);
    //                                 done(err, false);
    //                             });
    //                     }
    //                 })
    //                 .catch((err) => {
    //                     console.log(err);
    //                     done(err, false);
    //                 });
    //         }
    //     )
    // );

    // passport.serializeUser(function (user, done) {
    //     done(null, user.id);
    // });

    // passport.deserializeUser(function (id, done) {
    //     User.findById(id, function (err, user) {
    //         done(err, user);
    //     });
    // });
};