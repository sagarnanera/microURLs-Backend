const mongoose = require("mongoose");
mongoose.connect(
    process.env.MONGODB_URI,
    {
        dbName: "microURLs-db",
        useNewUrlParser: true,
        useUnifiedTopology: true,
        autoIndex: true,
    },
    (err) =>
        err ? console.log(err) : console.log(
            "Connected to microURLs database")
);

const conn = mongoose.connection;

module.exports = conn;