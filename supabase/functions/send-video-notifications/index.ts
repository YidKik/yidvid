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

interface VideoNotificationRequest {
  videoId: string;
  channelId: string;
  channelName: string;
  videoTitle: string;
  thumbnailUrl: string;
  videoUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Video notification function invoked");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { videoId, channelId, channelName, videoTitle, thumbnailUrl, videoUrl }: VideoNotificationRequest = await req.json();
    console.log(`Sending notifications for video: ${videoTitle} from ${channelName}`);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: subscribers, error: subError } = await supabase
      .from('channel_subscriptions')
      .select(`
        user_id,
        profiles!inner(email, name, email_notifications),
        email_preferences!inner(unsubscribe_token, new_video_emails, unsubscribed_at)
      `)
      .eq('channel_id', channelId)
      .eq('profiles.email_notifications', true)
      .eq('email_preferences.new_video_emails', true)
      .is('email_preferences.unsubscribed_at', null);

    if (subError) {
      console.error("Error fetching subscribers:", subError);
      throw subError;
    }

    if (!subscribers || subscribers.length === 0) {
      console.log("No subscribers to notify");
      return new Response(JSON.stringify({ success: true, sent: 0 }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log(`Found ${subscribers.length} subscribers to notify`);

    const batchSize = 50;
    let sentCount = 0;
    let failedCount = 0;

    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize);
      
      const emailPromises = batch.map(async (sub: any) => {
        try {
          const userEmail = sub.profiles.email;
          const userName = sub.profiles.name || userEmail.split('@')[0];
          const unsubscribeToken = sub.email_preferences.unsubscribe_token;
          const unsubscribeUrl = `${SITE_URL}/unsubscribe?token=${unsubscribeToken}`;

          const emailResponse = await resend.emails.send({
            from: "YidVid <noreply@yidvid.co>",
            to: [userEmail],
            subject: `New from ${channelName}: ${videoTitle}`,
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
                          
                          <!-- Header -->
                          <tr>
                            <td style="background-color: #FF0000; padding: 24px 40px; text-align: center; border-radius: 12px 12px 0 0;">
                              <img src="${LOGO_URL}" alt="YidVid" height="36" style="height: 36px; width: auto;" />
                            </td>
                          </tr>
                          
                          <!-- Yellow accent -->
                          <tr>
                            <td style="background-color: #FFCC00; height: 4px; font-size: 0; line-height: 0;">&nbsp;</td>
                          </tr>
                          
                          <!-- Body -->
                          <tr>
                            <td style="background-color: #ffffff; padding: 36px 40px;">
                              <p style="margin: 0 0 8px; font-size: 14px; color: #888888;">Hi ${userName},</p>
                              <h1 style="margin: 0 0 24px; font-size: 22px; font-weight: 700; color: #1a1a1a;">
                                New video from ${channelName}
                              </h1>
                              
                              <!-- Video card -->
                              <a href="${videoUrl}" style="text-decoration: none; display: block;">
                                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e5e5; border-radius: 10px; overflow: hidden; margin: 0 0 28px;">
                                  <tr>
                                    <td>
                                      <img src="${thumbnailUrl}" alt="${videoTitle}" width="520" style="width: 100%; height: auto; display: block;" />
                                    </td>
                                  </tr>
                                  <tr>
                                    <td style="padding: 16px 20px;">
                                      <p style="margin: 0 0 6px; font-size: 17px; font-weight: 600; color: #1a1a1a;">${videoTitle}</p>
                                      <p style="margin: 0; font-size: 13px; color: #888888;">📺 ${channelName}</p>
                                    </td>
                                  </tr>
                                </table>
                              </a>
                              
                              <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto 24px;">
                                <tr>
                                  <td style="background-color: #FF0000; border-radius: 8px;">
                                    <a href="${videoUrl}" style="display: inline-block; padding: 14px 36px; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none;">
                                      Watch Now
                                    </a>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                          
                          <!-- Footer -->
                          <tr>
                            <td style="background-color: #1a1a1a; padding: 24px 40px; border-radius: 0 0 12px 12px; text-align: center;">
                              <p style="margin: 0 0 8px; font-size: 12px; color: #999999;">
                                You're receiving this because you subscribed to ${channelName}
                              </p>
                              <p style="margin: 0; font-size: 12px;">
                                <a href="${SITE_URL}/settings/email-preferences" style="color: #666666; text-decoration: underline;">Email preferences</a>
                                <span style="color: #444444;"> · </span>
                                <a href="${unsubscribeUrl}" style="color: #666666; text-decoration: underline;">Unsubscribe</a>
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

          await supabase.from('email_logs').insert({
            user_id: sub.user_id,
            email_type: 'new_video',
            recipient_email: userEmail,
            subject: `New from ${channelName}: ${videoTitle}`,
            status: emailResponse.error ? 'failed' : 'sent',
            resend_message_id: emailResponse.data?.id
          });

          sentCount++;
          console.log(`Email sent to ${userEmail}`);
        } catch (emailError: any) {
          console.error(`Failed to send email to ${sub.profiles.email}:`, emailError);
          
          await supabase.from('email_logs').insert({
            user_id: sub.user_id,
            email_type: 'new_video',
            recipient_email: sub.profiles.email,
            subject: `New from ${channelName}: ${videoTitle}`,
            status: 'failed',
            error_message: emailError.message
          });
          
          failedCount++;
        }
      });

      await Promise.all(emailPromises);
      
      if (i + batchSize < subscribers.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log(`Notification complete: ${sentCount} sent, ${failedCount} failed`);

    return new Response(JSON.stringify({ 
      success: true, 
      sent: sentCount, 
      failed: failedCount 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-video-notifications function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
