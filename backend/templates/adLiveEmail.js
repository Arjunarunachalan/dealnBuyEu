/**
 * Returns styled HTML for the "Your Ad is Live" notification email.
 * Sent to the advertiser when their ad campaign is successfully created.
 *
 * @param {Object} options
 * @param {string} options.name          - Advertiser's first name.
 * @param {string} options.adTitle       - Title of the ad campaign.
 * @param {string} options.city          - Target city for the ad.
 * @param {number} options.radius        - Target radius in km.
 * @param {string} options.placement     - "homepage" or "category".
 * @param {number} options.targetImpressions - Target impressions count.
 * @param {string} [options.adImageUrl]  - First image URL of the ad (optional).
 * @param {string} [options.frontendUrl] - Frontend base URL.
 */
export const getAdLiveEmailHtml = ({
  name = "Advertiser",
  adTitle = "Your Campaign",
  city = "",
  radius = 10,
  placement = "homepage",
  targetImpressions = 0,
  adImageUrl = "",
  frontendUrl = "https://dealnbuy.eu",
}) => {
  const placementLabel = placement === "category" ? "Category Page" : "Homepage";

  const imageSection = adImageUrl
    ? `
      <tr>
        <td style="padding:0 40px 20px;">
          <div style="border-radius:12px;overflow:hidden;border:1px solid #eef0f2;">
            <img src="${adImageUrl}" alt="${adTitle}" style="display:block;width:100%;max-height:220px;object-fit:cover;" />
          </div>
        </td>
      </tr>`
    : "";

  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Your Ad is Live – DealNBuy EU</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f0f2f5;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f2f5;padding:40px 0;">
      <tr>
        <td align="center">
          <table width="520" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

            <!-- ===== HEADER ===== -->
            <tr>
              <td style="background:linear-gradient(135deg,#059669 0%,#10B981 50%,#34D399 100%);padding:40px 40px 30px;text-align:center;">
                <div style="font-size:40px;margin-bottom:10px;">🚀</div>
                <h1 style="color:#ffffff;margin:0 0 6px;font-size:24px;font-weight:700;letter-spacing:0.3px;">Your Ad is Live!</h1>
                <p style="color:rgba(255,255,255,0.85);margin:0;font-size:14px;">Campaign launched successfully</p>
              </td>
            </tr>

            <!-- ===== BODY ===== -->
            <tr>
              <td style="padding:35px 40px 15px;">
                <p style="color:#1a1a2e;font-size:16px;margin:0 0 16px;">Hello <strong>${name}</strong>,</p>
                <p style="color:#555555;font-size:14px;line-height:1.7;margin:0 0 24px;">
                  Great news! Your ad campaign <strong>"${adTitle}"</strong> has been published and is now being shown to users in your target area. Here's a quick summary:
                </p>
              </td>
            </tr>

            <!-- ===== AD IMAGE (if provided) ===== -->
            ${imageSection}

            <!-- ===== CAMPAIGN DETAILS TABLE ===== -->
            <tr>
              <td style="padding:0 40px 28px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
                  <!-- Table Header -->
                  <tr>
                    <td colspan="2" style="background-color:#f9fafb;padding:14px 20px;border-bottom:1px solid #e5e7eb;">
                      <p style="margin:0;color:#1a1a2e;font-size:14px;font-weight:700;">📊 Campaign Details</p>
                    </td>
                  </tr>
                  <!-- Row 1 -->
                  <tr>
                    <td style="padding:12px 20px;color:#888;font-size:13px;border-bottom:1px solid #f3f4f6;width:40%;">Campaign</td>
                    <td style="padding:12px 20px;color:#1a1a2e;font-size:13px;font-weight:600;border-bottom:1px solid #f3f4f6;">${adTitle}</td>
                  </tr>
                  <!-- Row 2 -->
                  <tr>
                    <td style="padding:12px 20px;color:#888;font-size:13px;border-bottom:1px solid #f3f4f6;">Placement</td>
                    <td style="padding:12px 20px;color:#1a1a2e;font-size:13px;font-weight:600;border-bottom:1px solid #f3f4f6;">
                      <span style="display:inline-block;background-color:${placement === "homepage" ? "#dbeafe" : "#fef3c7"};color:${placement === "homepage" ? "#1e40af" : "#92400e"};padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;text-transform:uppercase;">${placementLabel}</span>
                    </td>
                  </tr>
                  <!-- Row 3 -->
                  <tr>
                    <td style="padding:12px 20px;color:#888;font-size:13px;border-bottom:1px solid #f3f4f6;">Target Area</td>
                    <td style="padding:12px 20px;color:#1a1a2e;font-size:13px;font-weight:600;border-bottom:1px solid #f3f4f6;">📍 ${city} (${radius} km radius)</td>
                  </tr>
                  <!-- Row 4 -->
                  <tr>
                    <td style="padding:12px 20px;color:#888;font-size:13px;">Target Impressions</td>
                    <td style="padding:12px 20px;color:#1a1a2e;font-size:13px;font-weight:600;">🎯 ${Number(targetImpressions).toLocaleString()}</td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- ===== LIVE STATUS BADGE ===== -->
            <tr>
              <td style="padding:0 40px 28px;text-align:center;">
                <div style="display:inline-block;background-color:#ecfdf5;border:1px solid #a7f3d0;border-radius:30px;padding:10px 24px;">
                  <span style="display:inline-block;width:8px;height:8px;background-color:#10B981;border-radius:50%;margin-right:8px;vertical-align:middle;"></span>
                  <span style="color:#065f46;font-size:13px;font-weight:600;vertical-align:middle;">Campaign is Live &amp; Running</span>
                </div>
              </td>
            </tr>

            <!-- ===== CTA Button ===== -->
            <tr>
              <td style="padding:0 40px 30px;text-align:center;">
                <a href="${frontendUrl}/ad-portfolio" target="_blank" style="display:inline-block;background:linear-gradient(135deg,#059669,#10B981);color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:8px;font-size:15px;font-weight:600;letter-spacing:0.3px;">
                  View Campaign Dashboard →
                </a>
              </td>
            </tr>

            <!-- ===== TIP ===== -->
            <tr>
              <td style="padding:0 40px 24px;">
                <div style="background-color:#fffbeb;border-left:4px solid #f59e0b;border-radius:0 8px 8px 0;padding:14px 18px;">
                  <p style="margin:0;color:#92400e;font-size:12px;line-height:1.6;">
                    <strong>💡 Pro Tip:</strong> Monitor your campaign performance in real-time from your Ad Portfolio dashboard. You can track impressions and engagement as they happen!
                  </p>
                </div>
              </td>
            </tr>

            <!-- ===== FOOTER ===== -->
            <tr>
              <td style="background-color:#f9fafb;padding:22px 40px;text-align:center;border-top:1px solid #eef0f2;">
                <p style="color:#999;font-size:12px;margin:0 0 6px;">
                  Questions about your campaign? Reply to this email.
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
