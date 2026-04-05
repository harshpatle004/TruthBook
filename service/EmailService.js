const { BrevoClient } = require("@getbrevo/brevo");

console.log("API KEY:", process.env.BREVO_API_KEY);
console.log("SENDER:", process.env.BREVO_SENDER_EMAIL);

const brevo = new BrevoClient({ apiKey: process.env.BREVO_API_KEY });

const sendEmail = async (email, otp, firstName = "there") => {
  /*
    Brand colors derived from primary #9364C2:
    --primary:       #9364C2  (buttons, accents, links)
    --primary-dark:  #6B3FA0  (header bg, footer bg)
    --primary-deep:  #4A2878  (heading text, digit text)
    --primary-light: #C9A8E8  (border, logo accent)
    --primary-pale:  #F3EDF9  (otp box bg, body bg, field bg)
    --primary-mid:   #7B4FB0  (stamp bg, strong text)
  */

  const otpDigits = otp.split("").map(d =>
    `<td width="14%" style="padding:0 2px;">
      <div style="
        width:100%;
        max-width:48px;
        height:52px;
        background:#ffffff;
        border:1.5px solid #C9A8E8;
        border-radius:10px;
        text-align:center;
        line-height:52px;
        font-size:22px;
        font-weight:700;
        color:#4A2878;
        font-family:Arial,sans-serif;
        box-sizing:border-box;
      ">${d}</div>
    </td>`
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
    body            { margin:0; padding:0; background:#F3EDF9; font-family:Arial,sans-serif; }
    .tb-wrap        { padding:2rem 1rem; }
    .tb-card        { max-width:520px; margin:0 auto; background:#ffffff; border-radius:20px; overflow:hidden; border:1px solid #C9A8E8; }

    /* Header — primary dark */
    .tb-header      { background:#6B3FA0; padding:2rem 2rem 1.5rem; text-align:center; }
    .tb-logo        { font-size:26px; font-weight:700; color:#ffffff; }
    .tb-logo span   { color:#C9A8E8; }
    .tb-tagline     { font-size:11px; color:#C9A8E8; margin-top:4px; letter-spacing:2px; text-transform:uppercase; }

    /* Body */
    .tb-body        { padding:2rem 2rem; }
    .tb-stamp       { display:inline-block; background:#9364C2; color:#F3EDF9; font-size:10px; font-weight:600; letter-spacing:1px; text-transform:uppercase; padding:4px 12px; border-radius:20px; margin-bottom:1rem; }
    .tb-greeting    { font-size:18px; font-weight:700; color:#4A2878; margin-bottom:0.5rem; }
    .tb-msg         { font-size:14px; color:#888780; line-height:1.7; margin-bottom:1.75rem; }

    /* OTP section */
    .tb-otp-label   { font-size:11px; font-weight:600; letter-spacing:2px; text-transform:uppercase; color:#9364C2; margin-bottom:10px; }
    .tb-otp-box     { background:#F3EDF9; border:1.5px solid #C9A8E8; border-radius:14px; padding:1rem; margin-bottom:1.5rem; }

    /* Expiry */
    .tb-expiry      { font-size:12px; color:#B4B2A9; margin-bottom:1.75rem; }
    .tb-expiry span { color:#9364C2; font-weight:600; }

    /* Footer — primary deep */
    .tb-footer      { background:#4A2878; padding:1.25rem 2rem; text-align:center; }
    .tb-footer p    { margin:0; font-size:11px; color:#C9A8E8; line-height:1.6; }
    .tb-footer a    { color:#C9A8E8; }
  </style>
</head>
<body>
  <div class="tb-wrap">
    <div class="tb-card">

      <!-- Header -->
      <div class="tb-header">
        <div class="tb-logo">Truth<span>Book</span></div>
        <div class="tb-tagline">speak your truth</div>
      </div>

      <!-- Body -->
      <div class="tb-body">
        <div class="tb-stamp">Email Verification</div>
        <div class="tb-greeting">Hey ${firstName}, verify your email</div>
        <div class="tb-msg">
          You're one step away from joining TruthBook. Use the code below to verify
          your email address. This code is valid for
          <strong style="color:#9364C2;">5 minutes</strong>.
        </div>

        <div class="tb-otp-label">Your one-time code</div>

        <div class="tb-otp-box">
          <table
            cellpadding="0"
            cellspacing="0"
            border="0"
            width="100%"
            style="table-layout:fixed;"
          >
            <tr>${otpDigits}</tr>
          </table>
        </div>

        <div class="tb-expiry">● This code expires at <span>${expiryTime}</span></div>
      </div>

      <!-- Footer -->
      <div class="tb-footer">
        <p>You received this email because you signed up for TruthBook.<br/>
        If you didn't request this, please ignore this email.</p>
      </div>

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