
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase credentials");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Read request body to check for force parameter
    const { force = false } = await req.json();

    // Get current quota info
    const { data: currentQuota, error: quotaError } = await supabase
      .from("api_quota_tracking")
      .select("*")
      .eq("api_name", "youtube")
      .single();

    if (quotaError) {
      console.error("Error getting current quota:", quotaError);
      throw new Error("Failed to fetch quota information");
    }

    console.log("Current quota information:", currentQuota);

    // Reset quota if it's depleted or force is true
    if (force || currentQuota.quota_remaining <= 50) {
      console.log("Resetting quota...");
      
      // Determine an appropriate quota amount - not too high to avoid abuse
      const newQuota = force ? 100 : 50; 
      
      // Update the quota
      const { data: updatedQuota, error: updateError } = await supabase
        .from("api_quota_tracking")
        .update({
          quota_remaining: newQuota,
          updated_at: new Date().toISOString()
        })
        .eq("api_name", "youtube")
        .select()
        .single();

      if (updateError) {
        console.error("Error updating quota:", updateError);
        throw new Error("Failed to reset quota");
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: `Quota reset to ${newQuota}`,
          previous: currentQuota.quota_remaining,
          current: updatedQuota.quota_remaining
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      // No need to reset quota
      return new Response(
        JSON.stringify({
          success: true,
          message: "Quota is sufficient, no reset needed",
          current: currentQuota.quota_remaining
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Error in reset-youtube-quota:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      }
    );
  }
});
