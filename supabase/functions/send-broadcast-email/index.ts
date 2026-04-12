import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.12";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const BATCH_SIZE = 50;

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

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify admin role
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

    const { subject, body, filterType = "subscribed" } = await req.json();

    if (!subject || !body) {
      return new Response(
        JSON.stringify({ error: "Subject and body are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use service role client to query all users
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get recipient emails based on filter
    let recipientEmails: string[] = [];

    if (filterType === "all") {
      const { data: profiles } = await supabaseAdmin
        .from("profiles")
        .select("email")
        .not("email", "is", null);
      recipientEmails = (profiles || []).map((p: any) => p.email);
    } else {
      // subscribed only - respect email_preferences.general_emails
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

    // Log broadcast to database
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

    // Send emails in batches
    let successCount = 0;
    let failCount = 0;

    const unsubscribeBaseUrl = "https://yidvid.lovable.app/email-preferences";

    for (let i = 0; i < recipientEmails.length; i += BATCH_SIZE) {
      const batch = recipientEmails.slice(i, i + BATCH_SIZE);

      const sendPromises = batch.map(async (email) => {
        try {
          const htmlWithFooter = `
            ${body}
            <hr style="margin-top: 32px; border: none; border-top: 1px solid #e5e7eb;" />
            <p style="font-size: 12px; color: #9ca3af; text-align: center; margin-top: 16px;">
              You're receiving this because you're subscribed to YidVid updates.<br />
              <a href="${unsubscribeBaseUrl}" style="color: #8B5CF6;">Unsubscribe</a> from these emails.
            </p>
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
              html: htmlWithFooter,
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

      // Small delay between batches to respect rate limits
      if (i + BATCH_SIZE < recipientEmails.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    // Update broadcast status
    if (broadcast?.id) {
      await supabaseAdmin
        .from("broadcast_emails")
        .update({
          status: failCount === 0 ? "sent" : "partial",
          recipient_count: successCount,
        })
        .eq("id", broadcast.id);
    }

    // Log to email_logs
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
