const express = require('express');
const app = require('./src/app.js');
const bodyParser = require('body-parser');
const conn = require('./Dbconn/conn');
const logger = require('morgan');

const PORT = process.env.PORT | 5100;
const web_host = process.env.WEB_HOST;

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(logger('dev'));


app.listen(PORT, (err) => {
    if (err) console.log(err);
    console.log(`DEV_MODE :  ${process.env.IS_DEV} \n` + `server started on ${process.env.IS_DEV === "true" ?
        `http://${web_host}:${PORT}` : process.env.DOMAIN_NAME}`);
})
