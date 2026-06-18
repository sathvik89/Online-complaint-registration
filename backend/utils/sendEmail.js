const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Verify configuration exists
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('Email credentials missing from .env. Skipping email notification.');
    return;
  }

  // Create transporter (configured for Gmail by default, but customizable via env)
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: `"Complaint System" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: options.html
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email notification sent to ${options.email}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('Nodemailer Error: Failed to send email.', error.message);
  }
};

module.exports = sendEmail;
