const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
        user: process.env.MAILER,
        pass: process.env.EMAILPASS,
    },
});

const sendMail = async (to, subject, content, html) => {
    try {
        const mailOptions = {
            from: process.env.MAILER,
            to: to,
            subject: subject,
            text: html ? "" : content,
            html: html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.messageId);
        return { error: null, info };
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

module.exports = sendMail;