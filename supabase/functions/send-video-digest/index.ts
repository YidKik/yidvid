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

const handler = async (req: Request): Promise<Response> => {
  console.log("Video digest function invoked");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { frequency } = await req.json().catch(() => ({ frequency: 'daily' }));
    console.log(`Processing ${frequency} digest`);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get users who opted in for this frequency
    const { data: subscribers, error: subError } = await supabase
      .from('email_preferences')
      .select('user_id, digest_frequency, last_digest_sent_at, unsubscribe_token')
      .eq('new_video_emails', true)
      .eq('digest_frequency', frequency)
      .is('unsubscribed_at', null);

    if (subError) {
      console.error("Error fetching subscribers:", subError);
      throw subError;
    }

    if (!subscribers || subscribers.length === 0) {
      console.log("No subscribers for this frequency");
      return new Response(JSON.stringify({ success: true, sent: 0, reason: "no_subscribers" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log(`Found ${subscribers.length} subscribers for ${frequency} digest`);

    let sentCount = 0;
    let skippedCount = 0;

    for (const sub of subscribers) {
      try {
        // Get user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('email, name, username, email_notifications')
          .eq('id', sub.user_id)
          .single();

        if (!profile?.email || !profile.email_notifications) {
          skippedCount++;
          continue;
        }

        // Get user's subscribed channels
        const { data: subscriptions } = await supabase
          .from('channel_subscriptions')
          .select('channel_id')
          .eq('user_id', sub.user_id);

        if (!subscriptions || subscriptions.length === 0) {
          skippedCount++;
          continue;
        }

        const channelIds = subscriptions.map(s => s.channel_id);

        // Get new videos since last digest (or last 24h for daily, 7d for weekly)
        const sinceDate = sub.last_digest_sent_at 
          || new Date(Date.now() - (frequency === 'daily' ? 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000)).toISOString();

        const { data: newVideos } = await supabase
          .from('youtube_videos')
          .select('id, title, thumbnail, channel_name, video_id, uploaded_at')
          .in('channel_id', channelIds)
          .gt('created_at', sinceDate)
          .is('deleted_at', null)
          .order('created_at', { ascending: false })
          .limit(20);

        if (!newVideos || newVideos.length === 0) {
          skippedCount++;
          continue;
        }

        const userName = profile.username || profile.name || profile.email.split('@')[0];
        const unsubscribeUrl = `${SITE_URL}/unsubscribe?token=${sub.unsubscribe_token}`;

        // Build video cards HTML
        const videoCardsHtml = newVideos.map(video => `
          <a href="${SITE_URL}/video/${video.video_id}" style="text-decoration: none; display: block; margin-bottom: 16px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e5e5; border-radius: 10px; overflow: hidden;">
              <tr>
                <td>
                  <img src="${video.thumbnail}" alt="${video.title}" width="520" style="width: 100%; height: auto; display: block;" />
                </td>
              </tr>
              <tr>
                <td style="padding: 12px 16px;">
                  <p style="margin: 0 0 4px; font-size: 15px; font-weight: 600; color: #1a1a1a;">${video.title}</p>
                  <p style="margin: 0; font-size: 12px; color: #888888;">📺 ${video.channel_name}</p>
                </td>
              </tr>
            </table>
          </a>
        `).join('');

        const periodLabel = frequency === 'daily' ? 'today' : 'this week';
        const emailSubject = `${newVideos.length} new video${newVideos.length > 1 ? 's' : ''} from your channels`;

        await resend.emails.send({
          from: "YidVid <noreply@yidvid.co>",
          to: [profile.email],
          subject: emailSubject,
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
                            <img src="${LOGO_URL}" alt="YidVid" height="40" style="height: 40px; width: auto;" />
                          </td>
                        </tr>
                        <!-- Body -->
                        <tr>
                          <td style="background-color: #ffffff; padding: 0 40px 36px;">
                            <p style="margin: 0 0 8px; font-size: 14px; color: #888888;">Hi ${userName},</p>
                            <h1 style="margin: 0 0 8px; font-size: 22px; font-weight: 700; color: #1a1a1a;">
                              Your ${frequency} video digest
                            </h1>
                            <p style="margin: 0 0 24px; font-size: 15px; color: #444444;">
                              ${newVideos.length} new video${newVideos.length > 1 ? 's were' : ' was'} added ${periodLabel} from channels you follow:
                            </p>
                            ${videoCardsHtml}
                            <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 12px auto 0;">
                              <tr>
                                <td style="background-color: #FF0000; border-radius: 8px;">
                                  <a href="${SITE_URL}/videos" style="display: inline-block; padding: 14px 36px; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none;">
                                    Browse All Videos
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
                              You're receiving this because you subscribed to ${frequency} video digests
                            </p>
                            <p style="margin: 0; font-size: 12px;">
                              <a href="${SITE_URL}/settings" style="color: #666666; text-decoration: underline;">Email preferences</a>
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

        // Update last_digest_sent_at
        await supabase
          .from('email_preferences')
          .update({ last_digest_sent_at: new Date().toISOString() })
          .eq('user_id', sub.user_id);

        sentCount++;
        console.log(`Digest sent to ${profile.email} (${newVideos.length} videos)`);

        // Rate limit: small delay between sends
        await new Promise(resolve => setTimeout(resolve, 200));

      } catch (emailError: any) {
        console.error(`Failed to send digest to user ${sub.user_id}:`, emailError);
      }
    }

    console.log(`Digest complete: ${sentCount} sent, ${skippedCount} skipped`);

    return new Response(JSON.stringify({ 
      success: true, 
      sent: sentCount, 
      skipped: skippedCount 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-video-digest:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
