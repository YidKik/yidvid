import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Verify the JWT token
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const { action, sessionToken } = await req.json()

    if (action === 'invalidate-admin-session') {
      if (!sessionToken) {
        return new Response(
          JSON.stringify({ success: false, error: 'Session token required' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Invalidate the admin session
      const { error: deleteError } = await supabaseClient
        .from('admin_sessions')
        .delete()
        .eq('user_id', user.id)
        .eq('admin_token', sessionToken)

      if (deleteError) {
        console.log('Failed to invalidate admin session:', deleteError)
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to invalidate session' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Log security event
      await supabaseClient
        .from('security_events')
        .insert({
          user_id: user.id,
          event_type: 'admin_session_invalidated',
          details: { sessionToken: sessionToken.substring(0, 8) + '...' },
          severity: 'info'
        })

      return new Response(
        JSON.stringify({ success: true }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (action === 'cleanup-expired-sessions') {
      // Only allow admins to trigger cleanup
      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()

      if (!profile?.is_admin) {
        return new Response(
          JSON.stringify({ error: 'Admin access required' }),
          { 
            status: 403, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Clean up expired sessions
      const { error: cleanupError } = await supabaseClient
        .from('admin_sessions')
        .delete()
        .lt('expires_at', new Date().toISOString())

      if (cleanupError) {
        console.log('Failed to cleanup expired sessions:', cleanupError)
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to cleanup sessions' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Expired sessions cleaned up' }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Secure session manager error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})