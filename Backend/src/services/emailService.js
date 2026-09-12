import nodemailer from 'nodemailer';

/**
 * Creates and returns a Nodemailer transporter configured from environment variables.
 */
const getTransporter = () => {
  const user = process.env.SMTP_USER || process.env.GMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASSWORD;

  if (!user || !pass) {
    return null;
  }

  // If host is explicitly specified, use custom SMTP configuration
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: { user, pass }
    });
  }

  // Default to standard Gmail service
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass }
  });
};

/**
 * Sends a 6-digit verification code via email.
 *
 * @param {Object} options
 * @param {string} options.to - Recipient email address
 * @param {string} options.otp - 6-digit OTP code
 * @param {string} [options.purpose='registration'] - 'registration' or 'reset-password'
 * @returns {Promise<{ sent: boolean, reason?: string }>}
 */
export const sendOtpEmail = async ({ to, otp, purpose = 'registration' }) => {
  const transporter = getTransporter();

  const isReset = purpose === 'reset-password';
  const subject = isReset
    ? `[VELOOP] Your Password Reset Code: ${otp}`
    : `[VELOOP] Your Registration Verification Code: ${otp}`;

  const purposeText = isReset
    ? 'use this code to reset your password'
    : 'use this code to verify your email address and complete your account registration';

  if (!transporter) {
    console.warn(
      `\n⚠️ [VELOOP Email Service] SMTP credentials not configured in Backend/.env.` +
      `\n👉 Add SMTP_USER and SMTP_PASS (Gmail App Password) to send real emails.` +
      `\n👉 [OTP for ${to}]: ${otp}\n`
    );
    return { sent: false, reason: 'credentials_missing' };
  }

  const senderEmail = process.env.SMTP_FROM || process.env.SMTP_USER || process.env.GMAIL_USER;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 20px; }
          .container { max-width: 500px; margin: 0 auto; background-color: #1e293b; border-radius: 12px; border: 1px solid #334155; padding: 32px; }
          .logo { font-size: 24px; font-weight: 800; color: #38bdf8; margin-bottom: 20px; text-align: center; }
          .otp-box { background-color: #0f172a; border: 2px dashed #38bdf8; border-radius: 8px; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #38bdf8; text-align: center; padding: 18px; margin: 24px 0; }
          .footer { font-size: 12px; color: #94a3b8; text-align: center; margin-top: 24px; border-top: 1px solid #334155; padding-top: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">VELOOP REWARDS</div>
          <p>Hello,</p>
          <p>Please ${purposeText}:</p>
          <div class="otp-box">${otp}</div>
          <p>This verification code is valid for <strong>10 minutes</strong>. If you did not request this code, you can safely ignore this message.</p>
          <div class="footer">
            &copy; ${new Date().getFullYear()} VELOOP Rewards Giveaway. All rights reserved.
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"VELOOP Rewards" <${senderEmail}>`,
      to,
      subject,
      text: `Your VELOOP verification code is: ${otp}\n\nThis code will expire in 10 minutes.`,
      html: htmlContent
    });

    console.log(`✅ [VELOOP Email Service] Real email delivered to ${to}. MessageId: ${info.messageId}`);
    return { sent: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ [VELOOP Email Service] Failed to send email to ${to}:`, error.message);
    // Return sent: false so callers know it couldn't be dispatched
    return { sent: false, error: error.message };
  }
};
