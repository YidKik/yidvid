import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOGO_URL = "https://yidvid.lovable.app/yidvid-logo-full.png";
const SITE_URL = "https://yidvid.co";

interface ChannelRequestEmailRequest {
  email: string;
  name: string;
  channelName: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Channel request email function invoked");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, channelName }: ChannelRequestEmailRequest = await req.json();
    console.log(`Sending channel request confirmation to ${email} for channel: ${channelName}`);

    const emailResponse = await resend.emails.send({
      from: "YidVid <noreply@yidvid.co>",
      to: [email],
      subject: `Channel Request Received: ${channelName}`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
              <tr>
                <td align="center">
                  <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%;">
                    
                    <!-- Red top bar -->
                    <tr>
                      <td style="background-color: #FF0000; height: 6px; font-size: 0; line-height: 0; border-radius: 12px 12px 0 0;">&nbsp;</td>
                    </tr>
                    <!-- Yellow accent -->
                    <tr>
                      <td style="background-color: #FFCC00; height: 4px; font-size: 0; line-height: 0;">&nbsp;</td>
                    </tr>
                    <!-- Logo -->
                    <tr>
                      <td style="background-color: #ffffff; padding: 28px 40px 20px; text-align: center;">
                        <img src="${LOGO_URL}" alt="YidVid" height="56" style="height: 56px; width: auto;" />
                      </td>
                    </tr>
                    
                    <!-- Body -->
                    <tr>
                      <td style="background-color: #ffffff; padding: 0 40px 40px;">
                        <p style="margin: 0 0 8px; font-size: 14px; color: #888888;">Hi ${name},</p>
                        <h1 style="margin: 0 0 24px; font-size: 22px; font-weight: 700; color: #1a1a1a;">
                          Thank you for your channel request!
                        </h1>
                        
                        <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.6; color: #444444;">
                          We really appreciate you helping us keep YidVid updated with great content. Your request for the following channel has been received:
                        </p>
                        
                        <!-- Channel name card -->
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-left: 4px solid #FFCC00; background-color: #FFF9E6; border-radius: 0 8px 8px 0; margin: 0 0 24px;">
                          <tr>
                            <td style="padding: 16px 20px;">
                              <p style="margin: 0 0 4px; font-size: 12px; font-weight: 600; color: #888; text-transform: uppercase; letter-spacing: 0.5px;">Requested Channel</p>
                              <p style="margin: 0; font-size: 17px; font-weight: 600; color: #1a1a1a;">📺 ${channelName}</p>
                            </td>
                          </tr>
                        </table>
                        
                        <p style="margin: 0 0 28px; font-size: 15px; line-height: 1.6; color: #444444;">
                          Our team will review the channel to make sure it meets our content standards. If it's a good fit, we'll add it to the site and let you know!
                        </p>
                        
                        <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto 24px;">
                          <tr>
                            <td style="background-color: #FF0000; border-radius: 8px;">
                              <a href="${SITE_URL}/videos" style="display: inline-block; padding: 14px 36px; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none;">
                                Browse Videos
                              </a>
                            </td>
                          </tr>
                        </table>
                        
                        <p style="margin: 0; font-size: 14px; color: #888; text-align: center;">
                          Questions? Contact us at <a href="mailto:yidvid.info@gmail.com" style="color: #FF0000; text-decoration: none;">yidvid.info@gmail.com</a>
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="background-color: #1a1a1a; padding: 24px 40px; border-radius: 0 0 12px 12px; text-align: center;">
                        <p style="margin: 0; font-size: 12px; color: #999999;">
                          YidVid — Your Source for Jewish Video Content
                        </p>
                      </td>
                    </tr>
                    
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    });

    console.log("Channel request email sent:", emailResponse);

    return new Response(JSON.stringify({ success: true, messageId: emailResponse.data?.id }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-channel-request-email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
