const mongoose = require("mongoose");

const env = process.env.IS_DEV;
const HOST =
  env === "true" ? process.env.MONGODB_URI_LOCAL : process.env.MONGODB_URI;

mongoose
  .connect(HOST, {
    dbName: "microURLs-db",
    autoIndex: true
  })
  .then(() => {
    console.log(
      `Connected to microURLs database ${
        env === "true" ? "local" : "Atlas"
      } \n HOST: ${HOST}`
    );
  })
  .catch((err) => {
    console.log(err);
  });

const conn = mongoose.connection;

module.exports = conn;
