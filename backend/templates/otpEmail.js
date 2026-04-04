/**
 * Returns styled HTML for the OTP verification email.
 * Note: JavaScript doesn't work in emails — we use CSS `user-select: all`
 * so users can one-click select the OTP code to copy it.
 * @param {string} otp - The 6-digit OTP code.
 * @param {string} name - The user's name.
 */
export const getOtpEmailHtml = (otp, name = "User") => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body style="margin:0;padding:0;background-color:#f4f4f7;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f7;padding:40px 0;">
      <tr>
        <td align="center">
          <table width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
            <!-- Header -->
            <tr>
              <td style="background-color:#046BD2;padding:30px 40px;text-align:center;">
                <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:700;letter-spacing:0.5px;">DealNBuy EU</h1>
              </td>
            </tr>
            <!-- Body -->
            <tr>
              <td style="padding:35px 40px;">
                <p style="color:#333333;font-size:16px;margin:0 0 10px;">Hello <strong>${name}</strong>,</p>
                <p style="color:#555555;font-size:14px;line-height:1.6;margin:0 0 25px;">
                  We received a request to verify your email address. Please use the following One-Time Password to complete your registration:
                </p>
                <div style="text-align:center;margin:25px 0;">
                  <div style="display:inline-block;background-color:#f0f5ff;border:2px dashed #046BD2;border-radius:10px;padding:18px 40px;cursor:pointer;">
                    <p style="margin:0 0 6px;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;">Click code to select &amp; copy</p>
                    <span style="font-size:36px;font-weight:700;color:#046BD2;letter-spacing:10px;user-select:all;-webkit-user-select:all;-moz-user-select:all;-ms-user-select:all;">${otp}</span>
                  </div>
                </div>
                <p style="color:#888888;font-size:13px;line-height:1.5;margin:0 0 5px;">
                  ⏱ This code is valid for <strong>10 minutes</strong>.
                </p>
                <p style="color:#888888;font-size:13px;line-height:1.5;margin:0;">
                  If you did not request this code, please ignore this email.
                </p>
              </td>
            </tr>
            <!-- Footer -->
            <tr>
              <td style="background-color:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #eeeeee;">
                <p style="color:#aaaaaa;font-size:12px;margin:0;">
                  &copy; ${new Date().getFullYear()} DealNBuy EU. All rights reserved.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
};
