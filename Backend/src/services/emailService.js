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
    return { sent: false, error: error.message };
  }
};

/**
 * Sends a secure one-time verification link via email with a 3-minute expiry.
 *
 * @param {Object} options
 * @param {string} options.to - Recipient email address
 * @param {string} options.token - Secure verification token
 * @param {string} options.verificationLink - Full URL to frontend /verify-email?token=...
 * @returns {Promise<{ sent: boolean, reason?: string }>}
 */
export const sendVerificationLinkEmail = async ({ to, token, verificationLink }) => {
  const transporter = getTransporter();

  console.log(`\n======================================================`);
  console.log(`🔗 [VELOOP Email Verification]`);
  console.log(`👉 Recipient: ${to}`);
  console.log(`👉 Expiry: 3 minutes`);
  console.log(`👉 Verification Link: ${verificationLink}`);
  console.log(`======================================================\n`);

  if (!transporter) {
    console.warn(
      `\n⚠️ [VELOOP Email Service] SMTP credentials not configured in Backend/.env.` +
      `\n👉 Real email was not dispatched, but link is printed above for testing.` +
      `\n👉 Link: ${verificationLink}\n`
    );
    return { sent: false, reason: 'credentials_missing', verificationLink };
  }

  const senderEmail = process.env.SMTP_FROM || process.env.SMTP_USER || process.env.GMAIL_USER;
  const subject = `[VELOOP] Verify your email address (Expires in 3 minutes)`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b1120; color: #f8fafc; margin: 0; padding: 24px; }
          .container { max-width: 520px; margin: 0 auto; background-color: #1e293b; border-radius: 16px; border: 1px solid #334155; padding: 36px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); }
          .logo { font-size: 26px; font-weight: 800; letter-spacing: -0.5px; color: #38bdf8; margin-bottom: 24px; text-align: center; }
          .title { font-size: 20px; font-weight: 700; color: #ffffff; margin-bottom: 12px; text-align: center; }
          .description { font-size: 15px; color: #cbd5e1; line-height: 1.6; text-align: center; margin-bottom: 28px; }
          .btn-wrapper { text-align: center; margin: 28px 0; }
          .btn { display: inline-block; background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%); color: #ffffff !important; text-decoration: none; font-weight: 700; font-size: 16px; padding: 14px 32px; border-radius: 8px; box-shadow: 0 4px 14px 0 rgba(37, 99, 235, 0.39); }
          .warning-box { background-color: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 8px; padding: 12px 16px; font-size: 13px; color: #fcd34d; margin-top: 24px; text-align: center; }
          .alt-link { font-size: 12px; color: #94a3b8; word-break: break-all; margin-top: 24px; line-height: 1.5; }
          .alt-link a { color: #38bdf8; }
          .footer { font-size: 12px; color: #64748b; text-align: center; margin-top: 28px; border-top: 1px solid #334155; padding-top: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">⚡ VELOOP REWARDS</div>
          <div class="title">Verify Your Email Address</div>
          <p class="description">
            Thank you for registering with VELOOP Rewards! Click the button below to verify your email address and activate your account.
          </p>
          <div class="btn-wrapper">
            <a href="${verificationLink}" class="btn" target="_blank">Verify Email Address</a>
          </div>
          <div class="warning-box">
            ⏰ <strong>Important:</strong> This verification link will expire in <strong>3 minutes</strong> for your security.
          </div>
          <p class="alt-link">
            If the button above does not work, copy and paste this URL into your browser:<br>
            <a href="${verificationLink}">${verificationLink}</a>
          </p>
          <div class="footer">
            If you did not create an account on VELOOP Rewards, you can safely ignore this email.<br>&copy; ${new Date().getFullYear()} VELOOP Rewards. All rights reserved.
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
      text: `Verify your VELOOP account:\n\n${verificationLink}\n\nThis verification link expires in 3 minutes.`,
      html: htmlContent
    });

    console.log(`✅ [VELOOP Email Service] Verification link delivered to ${to}. MessageId: ${info.messageId}`);
    return { sent: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ [VELOOP Email Service] Failed to send verification link to ${to}:`, error.message);
    return { sent: false, error: error.message };
  }
};
