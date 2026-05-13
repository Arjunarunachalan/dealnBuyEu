/**
 * Returns styled HTML for the Welcome / Registration Success email.
 * Sent after the user successfully verifies their OTP.
 *
 * @param {string} name   - The user's first name.
 * @param {string} [frontendUrl] - The frontend base URL for the CTA button.
 */
export const getWelcomeEmailHtml = (name = "User", frontendUrl = "https://dealnbuy.eu") => {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Welcome to DealNBuy EU</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f0f2f5;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f2f5;padding:40px 0;">
      <tr>
        <td align="center">
          <table width="520" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

            <!-- ===== HEADER with gradient ===== -->
            <tr>
              <td style="background:linear-gradient(135deg,#046BD2 0%,#0A8FE6 50%,#38BDF8 100%);padding:40px 40px 30px;text-align:center;">
                <div style="font-size:40px;margin-bottom:10px;">🎉</div>
                <h1 style="color:#ffffff;margin:0 0 6px;font-size:24px;font-weight:700;letter-spacing:0.3px;">Welcome to DealNBuy EU!</h1>
                <p style="color:rgba(255,255,255,0.85);margin:0;font-size:14px;">Your account has been successfully verified</p>
              </td>
            </tr>

            <!-- ===== BODY ===== -->
            <tr>
              <td style="padding:35px 40px 25px;">
                <p style="color:#1a1a2e;font-size:16px;margin:0 0 16px;">Hello <strong>${name}</strong>,</p>
                <p style="color:#555555;font-size:14px;line-height:1.7;margin:0 0 24px;">
                  We're thrilled to have you on board! Your DealNBuy EU account is now fully set up and ready to go. You can start exploring thousands of listings across Europe's most vibrant marketplace.
                </p>

                <!-- Feature highlights -->
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                  <tr>
                    <td style="padding:14px 16px;background-color:#f0f7ff;border-radius:10px;margin-bottom:8px;">
                      <table cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="vertical-align:top;padding-right:12px;font-size:20px;">🔍</td>
                          <td>
                            <p style="margin:0;color:#1a1a2e;font-size:14px;font-weight:600;">Discover Deals Near You</p>
                            <p style="margin:4px 0 0;color:#666;font-size:12px;line-height:1.5;">Browse local listings with smart location-based search.</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr><td style="height:8px;"></td></tr>
                  <tr>
                    <td style="padding:14px 16px;background-color:#f0fdf4;border-radius:10px;">
                      <table cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="vertical-align:top;padding-right:12px;font-size:20px;">📢</td>
                          <td>
                            <p style="margin:0;color:#1a1a2e;font-size:14px;font-weight:600;">Post &amp; Sell Instantly</p>
                            <p style="margin:4px 0 0;color:#666;font-size:12px;line-height:1.5;">List your items in minutes and reach buyers across Europe.</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr><td style="height:8px;"></td></tr>
                  <tr>
                    <td style="padding:14px 16px;background-color:#fef3f2;border-radius:10px;">
                      <table cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="vertical-align:top;padding-right:12px;font-size:20px;">💬</td>
                          <td>
                            <p style="margin:0;color:#1a1a2e;font-size:14px;font-weight:600;">Chat with Sellers</p>
                            <p style="margin:4px 0 0;color:#666;font-size:12px;line-height:1.5;">Negotiate directly through our secure in-app messaging.</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <!-- CTA Button -->
                <div style="text-align:center;margin:0 0 10px;">
                  <a href="${frontendUrl}" target="_blank" style="display:inline-block;background:linear-gradient(135deg,#046BD2,#0A8FE6);color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:8px;font-size:15px;font-weight:600;letter-spacing:0.3px;">
                    Start Exploring →
                  </a>
                </div>
              </td>
            </tr>

            <!-- ===== FOOTER ===== -->
            <tr>
              <td style="background-color:#f9fafb;padding:22px 40px;text-align:center;border-top:1px solid #eef0f2;">
                <p style="color:#999;font-size:12px;margin:0 0 6px;">
                  Need help? Reply to this email and we'll be happy to assist.
                </p>
                <p style="color:#bbbbbb;font-size:11px;margin:0;">
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
