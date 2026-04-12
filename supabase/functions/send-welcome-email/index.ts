import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.47.12';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOGO_URL = "https://yidvid.lovable.app/yidvid-logo-full.png";
const SITE_URL = "https://yidvid.co";

interface WelcomeEmailRequest {
  userId: string;
  email: string;
  name: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Welcome email function invoked");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, email, name }: WelcomeEmailRequest = await req.json();
    console.log(`Sending welcome email to ${email}`);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data: preferences } = await supabase
      .from('email_preferences')
      .select('unsubscribe_token')
      .eq('user_id', userId)
      .single();

    const unsubscribeToken = preferences?.unsubscribe_token || '';
    const unsubscribeUrl = `${SITE_URL}/unsubscribe?token=${unsubscribeToken}`;

    const emailResponse = await resend.emails.send({
      from: "YidVid <noreply@yidvid.co>",
      to: [email],
      subject: "Welcome to YidVid! 🎬",
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
                        <img src="${LOGO_URL}" alt="YidVid" height="44" style="height: 44px; width: auto;" />
                      </td>
                    </tr>
                    
                    <!-- Body -->
                    <tr>
                      <td style="background-color: #ffffff; padding: 40px;">
                        <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: #1a1a1a;">
                          Welcome, ${name}! 🎉
                        </h1>
                        
                        <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #444444;">
                          You're now part of the YidVid community — your home for curated, kosher Jewish video content.
                        </p>
                        
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #FFF9E6; border-left: 4px solid #FFCC00; border-radius: 8px; margin: 0 0 28px;">
                          <tr>
                            <td style="padding: 20px 24px;">
                              <p style="margin: 0 0 12px; font-size: 15px; font-weight: 600; color: #1a1a1a;">Here's what you can do:</p>
                              <p style="margin: 0 0 8px; font-size: 14px; color: #444444;">📺 Browse thousands of curated Jewish videos</p>
                              <p style="margin: 0 0 8px; font-size: 14px; color: #444444;">🔔 Subscribe to your favorite channels</p>
                              <p style="margin: 0 0 8px; font-size: 14px; color: #444444;">📝 Create and manage playlists</p>
                              <p style="margin: 0; font-size: 14px; color: #444444;">💬 Join the community conversation</p>
                            </td>
                          </tr>
                        </table>
                        
                        <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto 28px;">
                          <tr>
                            <td style="background-color: #FF0000; border-radius: 8px;">
                              <a href="${SITE_URL}/videos" style="display: inline-block; padding: 14px 36px; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none;">
                                Start Watching
                              </a>
                            </td>
                          </tr>
                        </table>
                        
                        <p style="margin: 0; font-size: 14px; color: #888888; text-align: center;">
                          Questions? <a href="${SITE_URL}/contact" style="color: #FF0000; text-decoration: none;">Get in touch</a>
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="background-color: #1a1a1a; padding: 24px 40px; border-radius: 0 0 12px 12px; text-align: center;">
                        <p style="margin: 0 0 8px; font-size: 12px; color: #999999;">
                          YidVid — Your Source for Jewish Video Content
                        </p>
                        <a href="${unsubscribeUrl}" style="font-size: 12px; color: #666666; text-decoration: underline;">Unsubscribe</a>
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

    console.log("Welcome email sent successfully:", emailResponse);

    await supabase.from('email_logs').insert({
      user_id: userId,
      email_type: 'welcome',
      recipient_email: email,
      subject: 'Welcome to YidVid! 🎬',
      status: emailResponse.error ? 'failed' : 'sent',
      resend_message_id: emailResponse.data?.id,
      error_message: emailResponse.error?.message
    });

    return new Response(JSON.stringify({ success: true, messageId: emailResponse.data?.id }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-welcome-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
