import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.12";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOGO_URL = "https://yidvid.lovable.app/yidvid-logo-full.png";
const SITE_URL = "https://yidvid.co";

interface ContactNotificationRequest {
  type: "new_request" | "admin_reply";
  requestId: string;
  adminReply?: string;
}

function emailWrapper(content: string): string {
  return `
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
                  <td style="background-color: #ffffff; padding: 36px 40px;">
                    ${content}
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
  `;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, requestId, adminReply }: ContactNotificationRequest = await req.json();

    const { data: request, error: requestError } = await supabase
      .from("contact_requests")
      .select("*")
      .eq("id", requestId)
      .single();

    if (requestError || !request) {
      console.error("Error fetching contact request:", requestError);
      return new Response(
        JSON.stringify({ error: "Contact request not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (type === "new_request") {
      const { data: adminEmails, error: adminError } = await supabase
        .from("admin_email_settings")
        .select("email")
        .eq("receive_contact_notifications", true);

      if (adminError) {
        console.error("Error fetching admin emails:", adminError);
        return new Response(
          JSON.stringify({ error: "Failed to fetch admin emails" }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      if (adminEmails && adminEmails.length > 0) {
        const emails = adminEmails.map(admin => admin.email);
        
        // Admin notification
        await resend.emails.send({
          from: "YidVid <noreply@yidvid.co>",
          replyTo: "yidvid.info@gmail.com",
          to: emails,
          subject: `New Contact: ${request.category.replace("_", " ")}`,
          html: emailWrapper(`
            <h1 style="margin: 0 0 20px; font-size: 22px; font-weight: 700; color: #1a1a1a;">
              New Contact Request
            </h1>
            
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; border-radius: 8px; margin: 0 0 24px;">
              <tr><td style="padding: 20px;">
                <p style="margin: 0 0 8px; font-size: 14px; color: #444;"><strong>Category:</strong> ${request.category.replace("_", " ")}</p>
                <p style="margin: 0 0 8px; font-size: 14px; color: #444;"><strong>Name:</strong> ${request.name}</p>
                <p style="margin: 0 0 8px; font-size: 14px; color: #444;"><strong>Email:</strong> ${request.email}</p>
                <p style="margin: 0; font-size: 14px; color: #444;"><strong>Date:</strong> ${new Date(request.created_at).toLocaleDateString()}</p>
              </td></tr>
            </table>
            
            <p style="margin: 0 0 8px; font-size: 14px; font-weight: 600; color: #1a1a1a;">Message:</p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-left: 4px solid #FFCC00; background-color: #FFF9E6; border-radius: 0 8px 8px 0; margin: 0 0 28px;">
              <tr><td style="padding: 16px 20px;">
                <p style="margin: 0; font-size: 14px; color: #444; line-height: 1.6;">${request.message}</p>
              </td></tr>
            </table>
            
            <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
              <tr>
                <td style="background-color: #FF0000; border-radius: 8px;">
                  <a href="${SITE_URL}/admin/contact-requests" style="display: inline-block; padding: 12px 28px; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none;">
                    View in Dashboard
                  </a>
                </td>
              </tr>
            </table>
          `),
        });

        // User confirmation
        await resend.emails.send({
          from: "YidVid <noreply@yidvid.co>",
          replyTo: "yidvid.info@gmail.com",
          to: [request.email],
          subject: "We received your message!",
          html: emailWrapper(`
            <h1 style="margin: 0 0 20px; font-size: 22px; font-weight: 700; color: #1a1a1a;">
              Thanks for reaching out, ${request.name}!
            </h1>
            
            <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.6; color: #444444;">
              We've received your message and our team will get back to you within 24–48 hours.
            </p>
            
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-left: 4px solid #FFCC00; background-color: #FFF9E6; border-radius: 0 8px 8px 0; margin: 0 0 28px;">
              <tr><td style="padding: 16px 20px;">
                <p style="margin: 0 0 6px; font-size: 13px; font-weight: 600; color: #1a1a1a;">Your message:</p>
                <p style="margin: 0; font-size: 14px; color: #444; line-height: 1.6;">${request.message}</p>
              </td></tr>
            </table>
            
            <p style="margin: 0 0 28px; font-size: 14px; color: #888;">
              Need immediate help? Contact us at <a href="mailto:yidvid.info@gmail.com" style="color: #FF0000; text-decoration: none;">yidvid.info@gmail.com</a>
            </p>
            
            <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
              <tr>
                <td style="background-color: #FF0000; border-radius: 8px;">
                  <a href="${SITE_URL}" style="display: inline-block; padding: 12px 28px; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none;">
                    Visit YidVid
                  </a>
                </td>
              </tr>
            </table>
          `),
        });
      }

    } else if (type === "admin_reply" && adminReply) {
      await resend.emails.send({
        from: "YidVid Support <support@yidvid.co>",
        replyTo: "yidvid.info@gmail.com",
        to: [request.email],
        subject: `Re: Your ${request.category.replace("_", " ")} request`,
        html: emailWrapper(`
          <h1 style="margin: 0 0 20px; font-size: 22px; font-weight: 700; color: #1a1a1a;">
            We've responded to your request
          </h1>
          
          <p style="margin: 0 0 8px; font-size: 14px; color: #888;">Hello ${request.name},</p>
          
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-left: 4px solid #FF0000; background-color: #FFF5F5; border-radius: 0 8px 8px 0; margin: 16px 0 28px;">
            <tr><td style="padding: 16px 20px;">
              <p style="margin: 0; font-size: 15px; color: #1a1a1a; line-height: 1.6;">${adminReply}</p>
            </td></tr>
          </table>
          
          <p style="margin: 0 0 8px; font-size: 13px; font-weight: 600; color: #888;">Your original message:</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; border-radius: 8px; margin: 0 0 28px;">
            <tr><td style="padding: 16px 20px;">
              <p style="margin: 0; font-size: 13px; color: #666; line-height: 1.5;">${request.message}</p>
            </td></tr>
          </table>
          
          <p style="margin: 0; font-size: 14px; color: #888;">
            Need more help? Just reply to this email.
          </p>
        `),
      });
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error in send-contact-notifications function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
