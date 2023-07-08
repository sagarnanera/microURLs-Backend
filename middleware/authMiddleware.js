const passport = require("passport");

const authenticateJWT = async (req, res, next) => {

    try {
        passport.authenticate('jwt', function (err, user, info) {
            if (err) {
                // console.log(err);
                throw err
            };
            if (!user) {
                console.log("!user");
                return res.status(401).send({ errors: 'Not authorized.' });
            }
            req.user = user;
            next();
        })(req, res, next);

    } catch (error) {
        console.log(error);
        if (error.name === "JsonWebTokenError") {
            return res
                .status(401)
                .json({ success: false, message: "Invalid token. Not Authorized." });
        }
        return res
            .status(500)
            .json({ success: false, message: "Internal Server error" });
    }
};

module.exports = authenticateJWT;

// exports.authenticateGoogle = async (req, res, next) => {

//     try {

//         // TODO : auth logic

//         passport.authenticate('jwt', function (err, user, info) {
//             if (err) {
//                 console.log(err);
//                 return next(err);
//             };
//             if (info) {
//                 return res.status(401).send({ errors: info.message });
//             };
//             if (!user) {
//                 return res.status(401).send({ errors: 'User is not authenticated.' });
//             }
//             req.user = user;
//         });


//         next();
//     } catch (error) {
//         console.log(error);
//         if (error.name === "JsonWebTokenError") {
//             return res
//                 .status(401)
//                 .json({ success: false, message: "Invalid token. Not Authorized." });
//         }
//         return res
//             .status(500)
//             .json({ success: false, message: "Server internal error" });
//     }
// }