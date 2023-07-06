const mongoose = require("mongoose");

const env = process.env.IS_DEV;
const HOST = env === "true" ? process.env.MONGODB_URI_LOCAL : process.env.MONGODB_URI_LOCAL;

mongoose.connect(
    HOST,
    {
        dbName: "microURLs-db",
        useNewUrlParser: true,
        useUnifiedTopology: true,
        autoIndex: true,
    },
    (err) =>
        err ?
            console.log(err) :
            console.log(`Connected to microURLs database ${env === "true" ? "local" : "Atlas"}`)
);

const conn = mongoose.connection;

module.exports = conn;