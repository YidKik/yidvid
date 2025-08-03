import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RateLimitRequest {
  identifier: string; // IP or email
  attemptType: 'login' | 'admin_pin' | 'signup';
  action: 'check' | 'increment' | 'reset';
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

    const { identifier, attemptType, action }: RateLimitRequest = await req.json()
    
    if (!identifier || !attemptType || !action) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Rate limit thresholds
    const limits = {
      login: { maxAttempts: 5, windowMinutes: 15 },
      admin_pin: { maxAttempts: 3, windowMinutes: 30 },
      signup: { maxAttempts: 3, windowMinutes: 60 }
    }

    const limit = limits[attemptType]
    const windowStart = new Date(Date.now() - limit.windowMinutes * 60 * 1000)

    if (action === 'check') {
      // Check if identifier is currently rate limited
      const { data: rateLimitRecord } = await supabaseClient
        .from('auth_rate_limits')
        .select('*')
        .eq('identifier', identifier)
        .eq('attempt_type', attemptType)
        .single()

      if (!rateLimitRecord) {
        return new Response(
          JSON.stringify({ blocked: false, attemptsRemaining: limit.maxAttempts }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Check if blocked period has expired
      if (rateLimitRecord.blocked_until && new Date(rateLimitRecord.blocked_until) > new Date()) {
        return new Response(
          JSON.stringify({ 
            blocked: true, 
            blockedUntil: rateLimitRecord.blocked_until,
            message: `Too many attempts. Try again after ${new Date(rateLimitRecord.blocked_until).toLocaleTimeString()}`
          }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Check if within time window and over limit
      if (rateLimitRecord.first_attempt_at > windowStart && rateLimitRecord.attempts >= limit.maxAttempts) {
        const blockedUntil = new Date(Date.now() + limit.windowMinutes * 60 * 1000)
        
        // Update block time
        await supabaseClient
          .from('auth_rate_limits')
          .update({ blocked_until: blockedUntil.toISOString() })
          .eq('id', rateLimitRecord.id)

        return new Response(
          JSON.stringify({ 
            blocked: true, 
            blockedUntil: blockedUntil.toISOString(),
            message: `Too many attempts. Try again in ${limit.windowMinutes} minutes.`
          }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Reset if outside window
      if (rateLimitRecord.first_attempt_at <= windowStart) {
        await supabaseClient
          .from('auth_rate_limits')
          .update({ 
            attempts: 0,
            first_attempt_at: new Date().toISOString(),
            last_attempt_at: new Date().toISOString(),
            blocked_until: null
          })
          .eq('id', rateLimitRecord.id)
      }

      return new Response(
        JSON.stringify({ 
          blocked: false, 
          attemptsRemaining: limit.maxAttempts - rateLimitRecord.attempts 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'increment') {
      // Record failed attempt
      const { data: existing } = await supabaseClient
        .from('auth_rate_limits')
        .select('*')
        .eq('identifier', identifier)
        .eq('attempt_type', attemptType)
        .single()

      if (existing) {
        // Reset if outside window
        if (new Date(existing.first_attempt_at) <= windowStart) {
          await supabaseClient
            .from('auth_rate_limits')
            .update({
              attempts: 1,
              first_attempt_at: new Date().toISOString(),
              last_attempt_at: new Date().toISOString(),
              blocked_until: null
            })
            .eq('id', existing.id)
        } else {
          // Increment attempts
          await supabaseClient
            .from('auth_rate_limits')
            .update({
              attempts: existing.attempts + 1,
              last_attempt_at: new Date().toISOString()
            })
            .eq('id', existing.id)
        }
      } else {
        // Create new record
        await supabaseClient
          .from('auth_rate_limits')
          .insert({
            identifier,
            attempt_type: attemptType,
            attempts: 1,
            first_attempt_at: new Date().toISOString(),
            last_attempt_at: new Date().toISOString()
          })
      }

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'reset') {
      // Reset rate limit for successful auth
      await supabaseClient
        .from('auth_rate_limits')
        .delete()
        .eq('identifier', identifier)
        .eq('attempt_type', attemptType)

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Rate limit error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})