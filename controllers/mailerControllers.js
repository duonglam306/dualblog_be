import asyncHandler from "express-async-handler";
import nodemailer from "nodemailer";
import path from "path";
import hbs from "nodemailer-express-handlebars";

// @desc    Send mail verify sign up
// @route   GET /api/mailer/signUp
// @access  Public
const sendMailSignUp = asyncHandler(async (req, res) => {
    const { username, email } = req.body;
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const handlebarOptions = {
        viewEngine: {
            extName: ".handlebars",
            partialsDir: path.resolve("./controllers/signUp"),
            defaultLayout: false,
        },
        viewPath: path.resolve("./controllers/signUp"),
        extName: ".handlebars",
    };

    transporter.use("compile", hbs(handlebarOptions));

    var mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Get started with DualBlog",
        template: "email",
        context: {
            username: username,
            url_client: process.env.CLIENT_URL,
        },
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
            res.status(401);
            throw new Error("Send verify account email failed");
        } else {
            res.json({
                message: info.response,
            });
        }
    });
});


export { sendMailSignUp };
