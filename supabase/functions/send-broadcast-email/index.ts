import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.12";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const BATCH_SIZE = 50;
const LOGO_URL = "https://yidvid.lovable.app/yidvid-logo-full.png";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: isAdmin } = await supabaseClient.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });

    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: "Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { subject, body, filterType = "subscribed", selectedEmails } = await req.json();

    if (!subject || !body) {
      return new Response(
        JSON.stringify({ error: "Subject and body are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    let recipientEmails: string[] = [];

    if (filterType === "selected" && Array.isArray(selectedEmails) && selectedEmails.length > 0) {
      // Send to specific selected emails
      recipientEmails = selectedEmails.filter((e: any) => typeof e === "string" && e.includes("@"));
    } else if (filterType === "all") {
      const { data: profiles } = await supabaseAdmin
        .from("profiles")
        .select("email")
        .not("email", "is", null);
      recipientEmails = (profiles || []).map((p: any) => p.email);
    } else {
      const { data: prefs } = await supabaseAdmin
        .from("email_preferences")
        .select("user_id")
        .eq("general_emails", true)
        .is("unsubscribed_at", null);

      const subscribedUserIds = (prefs || []).map((p: any) => p.user_id);

      if (subscribedUserIds.length > 0) {
        const { data: profiles } = await supabaseAdmin
          .from("profiles")
          .select("email")
          .in("id", subscribedUserIds)
          .not("email", "is", null);
        recipientEmails = (profiles || []).map((p: any) => p.email);
      }
    }

    if (recipientEmails.length === 0) {
      return new Response(
        JSON.stringify({ error: "No recipients found" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: broadcast, error: insertError } = await supabaseAdmin
      .from("broadcast_emails")
      .insert({
        subject,
        body,
        sent_by: user.id,
        recipient_count: recipientEmails.length,
        status: "sending",
        filter_type: filterType,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error logging broadcast:", insertError);
    }

    let successCount = 0;
    let failCount = 0;

    const unsubscribeBaseUrl = "https://yidvid.co/email-preferences";

    for (let i = 0; i < recipientEmails.length; i += BATCH_SIZE) {
      const batch = recipientEmails.slice(i, i + BATCH_SIZE);

      const sendPromises = batch.map(async (email) => {
        try {
          const htmlWithBranding = `
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
                          <td style="background-color: #ffffff; padding: 36px 40px; font-size: 15px; line-height: 1.6; color: #444444;">
                            ${body}
                          </td>
                        </tr>
                        <!-- Footer -->
                        <tr>
                          <td style="background-color: #1a1a1a; padding: 24px 40px; border-radius: 0 0 12px 12px; text-align: center;">
                            <p style="margin: 0 0 8px; font-size: 12px; color: #999999;">
                              You're receiving this because you're subscribed to YidVid updates.
                            </p>
                            <a href="${unsubscribeBaseUrl}" style="font-size: 12px; color: #666666; text-decoration: underline;">Unsubscribe</a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </body>
            </html>
          `;

          const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
              from: "YidVid <noreply@yidvid.co>",
              to: [email],
              subject,
              html: htmlWithBranding,
            }),
          });

          if (res.ok) {
            successCount++;
          } else {
            const errText = await res.text();
            console.error(`Failed to send to ${email}:`, errText);
            failCount++;
          }
        } catch (err) {
          console.error(`Error sending to ${email}:`, err);
          failCount++;
        }
      });

      await Promise.all(sendPromises);

      if (i + BATCH_SIZE < recipientEmails.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    if (broadcast?.id) {
      await supabaseAdmin
        .from("broadcast_emails")
        .update({
          status: failCount === 0 ? "sent" : "partial",
          recipient_count: successCount,
        })
        .eq("id", broadcast.id);
    }

    await supabaseAdmin.from("email_logs").insert({
      email_type: "broadcast",
      subject,
      recipient_email: `broadcast_${recipientEmails.length}_recipients`,
      status: "sent",
      user_id: user.id,
    });

    return new Response(
      JSON.stringify({
        success: true,
        sent: successCount,
        failed: failCount,
        total: recipientEmails.length,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Broadcast email error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
