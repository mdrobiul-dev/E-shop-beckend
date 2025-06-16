const nodemailer = require("nodemailer");

const sendingEmail = async (email, subject, template, ...templateArg) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, 
    },
  });

  const mailOptions = {
    from: `"Chatweb Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: subject,
    html: template(...templateArg),
  };

  const info = await transporter.sendMail(mailOptions);
};

module.exports = sendingEmail;
