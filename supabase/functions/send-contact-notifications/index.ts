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

interface ContactNotificationRequest {
  type: "new_request" | "admin_reply";
  requestId: string;
  adminReply?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, requestId, adminReply }: ContactNotificationRequest = await req.json();

    // Get contact request details
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
      // Send notification to all admins
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
        
        await resend.emails.send({
          from: "Your Site <onboarding@resend.dev>",
          to: emails,
          subject: `New Contact Request: ${request.category.replace("_", " ")}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="text-align: center; padding: 20px; background-color: #f8f9fa;">
                <h1 style="color: #333; margin: 0;">New Contact Request</h1>
              </div>
              
              <div style="padding: 20px; background-color: white;">
                <h2 style="color: #333;">Request Details</h2>
                
                <p><strong>Category:</strong> ${request.category.replace("_", " ")}</p>
                <p><strong>Name:</strong> ${request.name}</p>
                <p><strong>Email:</strong> ${request.email}</p>
                <p><strong>Date:</strong> ${new Date(request.created_at).toLocaleDateString()}</p>
                
                <h3 style="color: #333;">Message:</h3>
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 10px 0;">
                  ${request.message}
                </div>
                
                <div style="text-align: center; margin-top: 30px;">
                  <a href="${supabaseUrl.replace('supabase.co', 'lovable.app')}/admin/contact-requests" 
                     style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                    View in Admin Dashboard
                  </a>
                </div>
              </div>
              
              <div style="text-align: center; padding: 20px; background-color: #f8f9fa; color: #666; font-size: 14px;">
                <p>This is an automated notification from your site admin panel.</p>
              </div>
            </div>
          `,
        });
      }

    } else if (type === "admin_reply" && adminReply) {
      // Send reply to user
      await resend.emails.send({
        from: "Your Site Support <onboarding@resend.dev>",
        to: [request.email],
        subject: `Re: Your ${request.category.replace("_", " ")} request`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="text-align: center; padding: 20px; background-color: #f8f9fa;">
              <h1 style="color: #333; margin: 0;">Response to Your Request</h1>
            </div>
            
            <div style="padding: 20px; background-color: white;">
              <p>Hello ${request.name},</p>
              
              <p>Thank you for contacting us. We have reviewed your ${request.category.replace("_", " ")} request and here is our response:</p>
              
              <div style="background-color: #e7f3ff; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #007bff;">
                ${adminReply}
              </div>
              
              <h3 style="color: #333;">Your Original Message:</h3>
              <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 10px 0;">
                ${request.message}
              </div>
              
              <p>If you have any further questions, please don't hesitate to contact us again.</p>
              
              <div style="text-align: center; margin-top: 30px;">
                <a href="${supabaseUrl.replace('supabase.co', 'lovable.app')}" 
                   style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  Visit Our Site
                </a>
              </div>
            </div>
            
            <div style="text-align: center; padding: 20px; background-color: #f8f9fa; color: #666; font-size: 14px;">
              <p>Best regards,<br>Your Support Team</p>
            </div>
          </div>
        `,
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