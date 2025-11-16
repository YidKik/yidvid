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

    // Get unsubscribe token
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data: preferences } = await supabase
      .from('email_preferences')
      .select('unsubscribe_token')
      .eq('user_id', userId)
      .single();

    const unsubscribeToken = preferences?.unsubscribe_token || '';
    const unsubscribeUrl = `https://yidvid.com/unsubscribe?token=${unsubscribeToken}`;

    const emailResponse = await resend.emails.send({
      from: "YidVid <onboarding@resend.dev>",
      to: [email],
      subject: "Welcome to YidVid - Your Gateway to Jewish Content! 🎥",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #ea384c 0%, #d32f3e 100%); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 32px;">🎬 YidVid</h1>
            </div>
            
            <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
              <h2 style="color: #ea384c; margin-top: 0;">Welcome, ${name}! 🎉</h2>
              
              <p style="font-size: 16px; margin: 20px 0;">
                We're thrilled to have you join the YidVid community! Get ready to explore a world of inspiring Jewish content.
              </p>
              
              <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 30px 0;">
                <h3 style="color: #ea384c; margin-top: 0;">What You Can Do on YidVid:</h3>
                <ul style="margin: 0; padding-left: 20px;">
                  <li style="margin: 10px 0;">📺 Browse 20,000+ curated Jewish videos</li>
                  <li style="margin: 10px 0;">🔔 Subscribe to your favorite channels</li>
                  <li style="margin: 10px 0;">📧 Get notified of new content via email</li>
                  <li style="margin: 10px 0;">📝 Create and manage playlists</li>
                  <li style="margin: 10px 0;">💬 Engage with the community</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 40px 0;">
                <a href="https://yidvid.com" style="display: inline-block; background: #ea384c; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                  Explore Videos
                </a>
              </div>
              
              <div style="text-align: center; margin: 20px 0;">
                <a href="https://yidvid.com/channels" style="color: #ea384c; text-decoration: none; font-size: 14px;">
                  Browse Channels →
                </a>
              </div>
              
              <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 40px 0;">
              
              <p style="font-size: 14px; color: #666; margin: 20px 0;">
                Need help getting started? Check out our <a href="https://yidvid.com/about" style="color: #ea384c; text-decoration: none;">About page</a> or <a href="https://yidvid.com/contact" style="color: #ea384c; text-decoration: none;">contact us</a>.
              </p>
              
              <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center;">
                <p style="font-size: 12px; color: #999; margin: 5px 0;">
                  YidVid - Your Source for Jewish Video Content
                </p>
                <p style="font-size: 12px; color: #999; margin: 5px 0;">
                  <a href="${unsubscribeUrl}" style="color: #999; text-decoration: underline;">Unsubscribe from all emails</a>
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Welcome email sent successfully:", emailResponse);

    // Log the email
    await supabase.from('email_logs').insert({
      user_id: userId,
      email_type: 'welcome',
      recipient_email: email,
      subject: 'Welcome to YidVid - Your Gateway to Jewish Content! 🎥',
      status: 'sent',
      resend_message_id: emailResponse.data?.id
    });

    return new Response(JSON.stringify({ success: true, messageId: emailResponse.data?.id }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-welcome-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
