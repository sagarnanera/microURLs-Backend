const app = require('./src/app.js');
const conn = require('./Dbconn/conn');

const PORT = process.env.PORT | 5100;
const web_host = process.env.WEB_HOST;

app.listen(PORT, (err) => {
    if (err) console.log(err);
    console.log(`DEV_MODE :  ${process.env.IS_DEV} \n` + `server started on ${process.env.IS_DEV === "true" ?
        `http://${web_host}:${PORT}` : process.env.DOMAIN_NAME}`);
})
