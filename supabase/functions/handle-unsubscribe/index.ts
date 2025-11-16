import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.47.12';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  console.log("Unsubscribe handler invoked");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');

    if (!token) {
      return new Response("Missing unsubscribe token", {
        status: 400,
        headers: corsHeaders,
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find the user with this unsubscribe token
    const { data: preferences, error: findError } = await supabase
      .from('email_preferences')
      .select('user_id, unsubscribed_at')
      .eq('unsubscribe_token', token)
      .single();

    if (findError || !preferences) {
      console.error("Error finding token:", findError);
      return new Response("Invalid unsubscribe token", {
        status: 404,
        headers: corsHeaders,
      });
    }

    // Check if already unsubscribed
    if (preferences.unsubscribed_at) {
      return new Response(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Already Unsubscribed - YidVid</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 40px auto;
                padding: 20px;
              }
              .container {
                background: #f5f5f5;
                border-radius: 10px;
                padding: 40px;
                text-align: center;
              }
              h1 { color: #ea384c; }
              a {
                display: inline-block;
                margin-top: 20px;
                padding: 12px 24px;
                background: #ea384c;
                color: white;
                text-decoration: none;
                border-radius: 6px;
              }
              a:hover { background: #d32f3e; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>✓ Already Unsubscribed</h1>
              <p>You have already unsubscribed from all YidVid emails.</p>
              <a href="https://yidvid.com">Return to YidVid</a>
            </div>
          </body>
        </html>
        `,
        {
          status: 200,
          headers: { "Content-Type": "text/html", ...corsHeaders },
        }
      );
    }

    // Unsubscribe the user
    const { error: updateError } = await supabase
      .from('email_preferences')
      .update({
        welcome_emails: false,
        new_video_emails: false,
        general_emails: false,
        unsubscribed_at: new Date().toISOString()
      })
      .eq('unsubscribe_token', token);

    if (updateError) {
      console.error("Error unsubscribing:", updateError);
      throw updateError;
    }

    console.log(`User ${preferences.user_id} unsubscribed successfully`);

    // Return success page
    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Unsubscribed - YidVid</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 40px auto;
              padding: 20px;
            }
            .container {
              background: #f5f5f5;
              border-radius: 10px;
              padding: 40px;
              text-align: center;
            }
            h1 { color: #ea384c; }
            p { margin: 20px 0; }
            .button {
              display: inline-block;
              margin: 10px;
              padding: 12px 24px;
              background: #ea384c;
              color: white;
              text-decoration: none;
              border-radius: 6px;
            }
            .button:hover { background: #d32f3e; }
            .secondary {
              background: #666;
            }
            .secondary:hover { background: #555; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>✓ Successfully Unsubscribed</h1>
            <p>You have been unsubscribed from all YidVid emails.</p>
            <p>We're sorry to see you go! You can always resubscribe in your account settings.</p>
            <div>
              <a href="https://yidvid.com/settings/email-preferences" class="button secondary">Manage Preferences</a>
              <a href="https://yidvid.com" class="button">Return to YidVid</a>
            </div>
          </div>
        </body>
      </html>
      `,
      {
        status: 200,
        headers: { "Content-Type": "text/html", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in handle-unsubscribe function:", error);
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
