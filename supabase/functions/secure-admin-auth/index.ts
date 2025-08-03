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
      console.log('No authorization header provided')
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
      console.log('Invalid or expired token:', userError)
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const { action, pin } = await req.json()

    if (action === 'verify-pin') {
      // Secure PIN verification
      const ADMIN_PIN = Deno.env.get('ADMIN_PIN')
      
      if (!ADMIN_PIN) {
        console.log('Admin PIN not configured in environment')
        return new Response(
          JSON.stringify({ error: 'Admin PIN not configured' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      if (pin !== ADMIN_PIN) {
        console.log('Invalid PIN attempt for user:', user.id)
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid PIN' }),
          { 
            status: 403, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Generate a secure admin session token (valid for 1 hour)
      const adminToken = crypto.randomUUID()
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now

      // Store the admin session in the database
      const { error: insertError } = await supabaseClient
        .from('admin_sessions')
        .insert({
          user_id: user.id,
          admin_token: adminToken,
          expires_at: expiresAt.toISOString(),
          created_at: new Date().toISOString()
        })

      if (insertError) {
        console.log('Failed to create admin session:', insertError)
        return new Response(
          JSON.stringify({ error: 'Failed to create admin session' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      console.log('Admin access granted for user:', user.id)
      return new Response(
        JSON.stringify({ 
          success: true, 
          adminToken,
          expiresAt: expiresAt.toISOString()
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (action === 'verify-admin') {
      const { adminToken } = await req.json()
      
      if (!adminToken) {
        return new Response(
          JSON.stringify({ isAdmin: false }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Check if the admin token is valid and not expired
      const { data: adminSession, error: sessionError } = await supabaseClient
        .from('admin_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('admin_token', adminToken)
        .gt('expires_at', new Date().toISOString())
        .single()

      if (sessionError || !adminSession) {
        console.log('Invalid or expired admin token for user:', user.id)
        return new Response(
          JSON.stringify({ isAdmin: false }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Also check if user has admin privileges in the profiles table
      const { data: profile, error: profileError } = await supabaseClient
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()

      const isAdmin = adminSession && (profile?.is_admin === true)
      
      console.log('Admin verification result for user:', user.id, 'isAdmin:', isAdmin)
      return new Response(
        JSON.stringify({ isAdmin }),
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
    console.error('Secure admin auth error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})