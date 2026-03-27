import nodemailer from "nodemailer";

let transporter = null;

/**
 * Lazily create the transporter so env vars are available (dotenv has loaded).
 */
const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: "smtp.hostinger.com",
      port: 465,
      secure: true,
      pool: true,
      auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });
  }
  return transporter;
};

/**
 * Reusable mail sender — use for OTP, product notifications, order confirmations, etc.
 * @param {Object} options - { to, subject, html }
 */
export const sendMail = async ({ to, subject, html }) => {
  try {
    const info = await getTransporter().sendMail({
      from: `"DealNBuy EU" <${process.env.AUTH_EMAIL}>`,
      to,
      subject,
      html,
    });
    console.log(`Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`Email send failed to ${to}:`, error.message);
    throw error;
  }
};

export default getTransporter;
