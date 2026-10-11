import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, html) => {
  // Local development without email credentials:
  // print the message to the console instead of failing.
  if (
    (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) &&
    process.env.NODE_ENV !== "production"
  ) {
    const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    console.log(`📧 [DEV EMAIL] To: ${to} | ${subject} | ${text}`);
    return;
  }

  try {
    await transporter.sendMail({
      from: `"ResolveHub" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log(`✅ Email sent successfully to ${to}`);
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
    throw new Error("Failed to send email.");
  }
};

export default sendEmail;