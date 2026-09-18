/**
 * Service to dispatch SMS OTP messages to real mobile phones.
 * Supports Fast2SMS (India), Twilio (Global), and 2Factor.in.
 */

export const sendSmsOtp = async ({ phone, otp }) => {
  // Strip non-digits for services that need clean 10-digit numbers
  const digits = String(phone).replace(/\D/g, '');
  const local10Digits = digits.slice(-10);

  // 1. FAST2SMS (India)
  // Get free API key from https://www.fast2sms.com/
  const fast2smsApiKey = process.env.FAST2SMS_API_KEY;
  if (fast2smsApiKey) {
    try {
      const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          authorization: fast2smsApiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          route: 'otp',
          variables_values: String(otp),
          numbers: local10Digits
        })
      });
      const data = await response.json();
      if (data.return) {
        console.log(`✅ [Fast2SMS] Successfully sent OTP to ${phone}`);
        return { sent: true, provider: 'fast2sms', data };
      } else {
        console.warn(`⚠️ [Fast2SMS] Failed to send SMS:`, data.message);
      }
    } catch (err) {
      console.error(`❌ [Fast2SMS] Error sending SMS:`, err.message);
    }
  }

  // 2. 2FACTOR.IN (India OTP service)
  // Get API key from https://2factor.in/
  const twoFactorApiKey = process.env.TWOFACTOR_API_KEY;
  if (twoFactorApiKey) {
    try {
      const url = `https://2factor.in/API/V1/${twoFactorApiKey}/SMS/${local10Digits}/${otp}/OTP1`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.Status === 'Success') {
        console.log(`✅ [2Factor] Successfully sent OTP to ${phone}`);
        return { sent: true, provider: '2factor', data };
      } else {
        console.warn(`⚠️ [2Factor] Failed to send SMS:`, data.Details);
      }
    } catch (err) {
      console.error(`❌ [2Factor] Error sending SMS:`, err.message);
    }
  }

  // 3. TWILIO (Global)
  // Configure TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioAuth = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_PHONE_NUMBER;
  if (twilioSid && twilioAuth && twilioFrom) {
    try {
      const authHeader = 'Basic ' + Buffer.from(`${twilioSid}:${twilioAuth}`).toString('base64');
      const params = new URLSearchParams();
      params.append('To', phone.startsWith('+') ? phone : `+91${phone}`);
      params.append('From', twilioFrom);
      params.append('Body', `[VELOOP Rewards] Your verification code is ${otp}. Valid for 5 minutes.`);

      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
        method: 'POST',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
      });
      const data = await response.json();
      if (data.sid) {
        console.log(`✅ [Twilio] Successfully sent SMS to ${phone}. SID: ${data.sid}`);
        return { sent: true, provider: 'twilio', sid: data.sid };
      } else {
        console.warn(`⚠️ [Twilio] Failed to send SMS:`, data.message);
      }
    } catch (err) {
      console.error(`❌ [Twilio] Error sending SMS:`, err.message);
    }
  }

  // Fallback notice if no SMS gateway credentials configured
  console.warn(
    `\n⚠️ [VELOOP SMS Gateway] No SMS provider API key configured in Backend/.env.` +
    `\n👉 To send real SMS to mobile phones, add one of the following to Backend/.env:` +
    `\n   1) FAST2SMS_API_KEY=your_key (from https://www.fast2sms.com/)` +
    `\n   2) TWOFACTOR_API_KEY=your_key (from https://2factor.in/)` +
    `\n   3) TWILIO_ACCOUNT_SID=... TWILIO_AUTH_TOKEN=... TWILIO_PHONE_NUMBER=...` +
    `\n👉 [OTP for ${phone}]: ${otp}\n`
  );

  return { sent: false, reason: 'no_sms_gateway_configured', phone, otp };
};
