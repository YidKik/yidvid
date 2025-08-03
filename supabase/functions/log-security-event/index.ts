import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SecurityEventRequest {
  eventType: 'failed_login' | 'admin_access' | 'suspicious_activity' | 'brute_force' | 'invalid_session';
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
  severity?: 'info' | 'warning' | 'critical';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { 
      eventType, 
      userId, 
      ipAddress, 
      userAgent, 
      details, 
      severity = 'info' 
    }: SecurityEventRequest = await req.json()
    
    if (!eventType) {
      return new Response(
        JSON.stringify({ error: 'Event type is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get client IP if not provided
    const clientIp = ipAddress || req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 'unknown'
    
    // Get user agent if not provided
    const clientUserAgent = userAgent || req.headers.get('user-agent') || 'unknown'

    // Insert security event
    const { error } = await supabaseClient
      .from('security_events')
      .insert({
        event_type: eventType,
        user_id: userId || null,
        ip_address: clientIp,
        user_agent: clientUserAgent,
        details: details || {},
        severity
      })

    if (error) {
      console.error('Failed to log security event:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to log security event' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check for suspicious patterns
    if (severity === 'critical' || eventType === 'brute_force') {
      // Could integrate with alerting system here
      console.warn(`CRITICAL SECURITY EVENT: ${eventType} from ${clientIp}`, details)
    }

    console.log(`Security event logged: ${eventType} from ${clientIp}`)
    
    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Security logging error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})