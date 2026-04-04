const { BrevoClient } = require("@getbrevo/brevo");

console.log("API KEY:", process.env.BREVO_API_KEY);
console.log("SENDER:", process.env.BREVO_SENDER_EMAIL);

const brevo = new BrevoClient({ apiKey: process.env.BREVO_API_KEY });

const sendEmail = async (email, otp, firstName = "there") => {
  const otpDigits = otp.split("").map(d =>
    `<div class="tb-digit">${d}</div>`
  ).join("");

  const expiryTime = new Date(Date.now() + 5 * 60 * 1000).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit"
  });

  const MAX_RETRIES = 3;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const info = await brevo.transactionalEmails.sendTransacEmail({
        sender: { name: "TruthBook", email: process.env.BREVO_SENDER_EMAIL },
        to: [{ email }],
        subject: "Your TruthBook verification code",
        htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <style>
    body { margin: 0; padding: 0; background: #F4F2FF; font-family: Arial, sans-serif; }
    .tb-wrap { padding: 2rem 1rem; }
    .tb-card { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #CECBF6; }
    .tb-header { background: #3C3489; padding: 2rem 2rem 1.5rem; text-align: center; }
    .tb-logo { font-size: 26px; font-weight: 700; color: #fff; }
    .tb-logo span { color: #AFA9EC; }
    .tb-tagline { font-size: 11px; color: #AFA9EC; margin-top: 4px; letter-spacing: 2px; text-transform: uppercase; }
    .tb-body { padding: 2rem 2.5rem; }
    .tb-stamp { display: inline-block; background: #534AB7; color: #EEEDFE; font-size: 10px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; padding: 4px 10px; border-radius: 20px; margin-bottom: 1rem; }
    .tb-greeting { font-size: 18px; font-weight: 700; color: #26215C; margin-bottom: 0.5rem; }
    .tb-msg { font-size: 14px; color: #888780; line-height: 1.7; margin-bottom: 1.75rem; }
    .tb-otp-label { font-size: 11px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: #7F77DD; margin-bottom: 10px; }
    .tb-otp-box { background: #EEEDFE; border: 1.5px solid #AFA9EC; border-radius: 14px; padding: 1.25rem; text-align: center; margin-bottom: 1.5rem; }
    .tb-digit { display: inline-block; width: 44px; height: 52px; background: #fff; border: 1.5px solid #CECBF6; border-radius: 10px; text-align: center; line-height: 52px; font-size: 24px; font-weight: 700; color: #3C3489; margin: 0 4px; }
    .tb-expiry { font-size: 12px; color: #B4B2A9; margin-bottom: 1.75rem; }
    .tb-expiry span { color: #7F77DD; font-weight: 600; }
    .tb-footer { background: #26215C; padding: 1.25rem 2.5rem; }
  </style>
</head>
<body>
  <div class="tb-wrap">
    <div class="tb-card">
      <div class="tb-header">
        <div class="tb-logo">Truth<span>Book</span></div>
        <div class="tb-tagline">speak your truth</div>
      </div>
      <div class="tb-body">
        <div class="tb-stamp">Email Verification</div>
        <div class="tb-greeting">Hey ${firstName}, verify your email</div>
        <div class="tb-msg">
          You're one step away from joining TruthBook. Use the code below to verify your email address.
          This code is valid for <strong style="color:#534AB7;">5 minutes</strong>.
        </div>
        <div class="tb-otp-label">Your one-time code</div>
        <div class="tb-otp-box">${otpDigits}</div>
        <div class="tb-expiry">● This code expires at <span>${expiryTime}</span></div>
      </div>
      <div class="tb-footer"></div>
    </div>
  </div>
</body>
</html>
        `,
      });

      console.log(`✅ OTP sent to ${email}`);
      return info;

    } catch (err) {
      console.error(`❌ Attempt ${attempt} failed:`, err.message);
      if (attempt === MAX_RETRIES) throw new Error("Failed to send OTP after 3 attempts");
      await new Promise((res) => setTimeout(res, 1000 * attempt));
    }
  }
};

module.exports = sendEmail;