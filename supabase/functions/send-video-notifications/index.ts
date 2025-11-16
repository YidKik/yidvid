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

    // Get all subscribers who want email notifications
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

    // Send emails in batches of 50 to avoid rate limits
    const batchSize = 50;
    let sentCount = 0;
    let failedCount = 0;

    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize);
      
      // Send emails in parallel within batch
      const emailPromises = batch.map(async (sub: any) => {
        try {
          const userEmail = sub.profiles.email;
          const userName = sub.profiles.name || userEmail.split('@')[0];
          const unsubscribeToken = sub.email_preferences.unsubscribe_token;
          const unsubscribeUrl = `https://yidvid.com/unsubscribe?token=${unsubscribeToken}`;

          const emailResponse = await resend.emails.send({
            from: "YidVid <onboarding@resend.dev>",
            to: [userEmail],
            subject: `New Video from ${channelName} - ${videoTitle}`,
            html: `
              <!DOCTYPE html>
              <html>
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <div style="background: linear-gradient(135deg, #ea384c 0%, #d32f3e 100%); padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0; font-size: 24px;">🎬 New Video on YidVid</h1>
                  </div>
                  
                  <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
                    <p style="font-size: 16px; margin-top: 0;">Hi ${userName},</p>
                    
                    <p style="font-size: 16px;">
                      <strong>${channelName}</strong> just uploaded a new video you might enjoy!
                    </p>
                    
                    <div style="background: #f5f5f5; border-radius: 8px; overflow: hidden; margin: 30px 0;">
                      <a href="${videoUrl}" style="text-decoration: none; color: inherit; display: block;">
                        <img src="${thumbnailUrl}" alt="${videoTitle}" style="width: 100%; height: auto; display: block;">
                        <div style="padding: 20px;">
                          <h2 style="color: #333; margin: 0 0 10px 0; font-size: 20px;">${videoTitle}</h2>
                          <p style="color: #666; margin: 0; font-size: 14px;">📺 ${channelName}</p>
                        </div>
                      </a>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                      <a href="${videoUrl}" style="display: inline-block; background: #ea384c; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                        Watch Now
                      </a>
                    </div>
                    
                    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
                    
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center;">
                      <p style="font-size: 12px; color: #999; margin: 5px 0;">
                        You received this because you're subscribed to ${channelName}
                      </p>
                      <p style="font-size: 12px; color: #999; margin: 5px 0;">
                        <a href="https://yidvid.com/settings/email-preferences" style="color: #999; text-decoration: underline;">Manage email preferences</a> | 
                        <a href="${unsubscribeUrl}" style="color: #999; text-decoration: underline;">Unsubscribe from all emails</a>
                      </p>
                    </div>
                  </div>
                </body>
              </html>
            `,
          });

          // Log the email
          await supabase.from('email_logs').insert({
            user_id: sub.user_id,
            email_type: 'new_video',
            recipient_email: userEmail,
            subject: `New Video from ${channelName} - ${videoTitle}`,
            status: 'sent',
            resend_message_id: emailResponse.data?.id
          });

          sentCount++;
          console.log(`Email sent to ${userEmail}`);
        } catch (emailError: any) {
          console.error(`Failed to send email to ${sub.profiles.email}:`, emailError);
          
          // Log the failure
          await supabase.from('email_logs').insert({
            user_id: sub.user_id,
            email_type: 'new_video',
            recipient_email: sub.profiles.email,
            subject: `New Video from ${channelName} - ${videoTitle}`,
            status: 'failed',
            error_message: emailError.message
          });
          
          failedCount++;
        }
      });

      await Promise.all(emailPromises);
      
      // Wait 1 second between batches to avoid rate limits
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
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-video-notifications function:", error);
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
