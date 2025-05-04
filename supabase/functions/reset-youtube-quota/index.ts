
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get quota data
    const { data: quota, error: quotaError } = await supabase
      .from("api_quota_tracking")
      .select("*")
      .eq("api_name", "youtube")
      .single();
      
    if (quotaError) {
      throw new Error(`Error getting quota data: ${quotaError.message}`);
    }
    
    console.log("Current quota information:", quota);
    
    // Parse request body
    let force = false;
    try {
      const body = await req.json();
      force = !!body.force;
    } catch (e) {
      // No body or invalid JSON
    }
    
    // Check if we need to reset quota
    const now = new Date();
    const quotaResetAt = new Date(quota.quota_reset_at);
    const shouldReset = force || now >= quotaResetAt;
    
    console.log("Resetting quota...");
    
    if (shouldReset) {
      // Set next reset time to midnight UTC tomorrow
      const tomorrow = new Date();
      tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
      tomorrow.setUTCHours(0, 0, 0, 0);
      
      const { data: updated, error: updateError } = await supabase
        .from("api_quota_tracking")
        .update({
          quota_remaining: force ? 500 : 10000, // Use smaller amount if forced reset
          quota_reset_at: tomorrow.toISOString(),
          last_reset: now.toISOString(),
          updated_at: now.toISOString()
        })
        .eq("api_name", "youtube")
        .select()
        .single();
        
      if (updateError) {
        throw new Error(`Error updating quota: ${updateError.message}`);
      }
      
      return new Response(
        JSON.stringify({
          success: true,
          message: force ? "Forced quota reset" : "Quota reset due to time",
          old: quota,
          new: updated,
          nextReset: tomorrow.toISOString()
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200
        }
      );
    }
    
    // If we have a backup API key, provide it in the response
    const fallbackApiKey = "AIzaSyDeEEZoXZfGHiNvl9pMf18N43TECw07ANk";
    
    return new Response(
      JSON.stringify({
        success: true,
        message: "No reset needed, using fallback API key",
        quotaStatus: quota,
        nextReset: quotaResetAt.toISOString(),
        hasFallbackKey: true
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      }
    );
    
  } catch (error) {
    console.error("Error:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      }
    );
  }
});
