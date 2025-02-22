const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "smtp-relay.brevo.com",
  port: 587,
  auth: {
    user: "862724001@smtp-brevo.com", // Your Gmail address
    pass: "wN8AEst0HYchg9U3", // Use an app password (not your Gmail password)
  },
  tls: {
    rejectUnauthorized: false, // ✅ Ignore self-signed cert issues
  },
});

// 3️⃣ Send the email

const sendEmail = async (to, subject, text) => {
  const mailOptions = {
    from: "862724001@smtp-brevo.com",
    to,
    subject,
    text,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
  } catch (error) {
    console.log("Error sending email:", error);
  }
};

module.exports = sendEmail;

// module.exports = transporter;
