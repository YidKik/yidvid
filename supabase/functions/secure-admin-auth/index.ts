import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { hash, compare } from 'https://deno.land/x/bcrypt@v0.4.1/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Input validation
const validateUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

const validatePIN = (pin: string): boolean => {
  return typeof pin === 'string' && pin.length >= 4 && pin.length <= 50;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const body = await req.json()
    const { action, pin, adminToken } = body

    if (action === 'verify-pin') {
      // Validate PIN input
      if (!pin || !validatePIN(pin)) {
        return new Response(
          JSON.stringify({ isValid: false }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      // Get hashed PIN from database
      const { data: adminConfig, error: configError } = await supabaseAdmin
        .from('admin_config')
        .select('pin_hash')
        .limit(1)
        .single()
      
      if (configError || !adminConfig) {
        console.error('Admin configuration not found')
        return new Response(
          JSON.stringify({ error: 'Configuration error' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      // Use constant-time comparison via bcrypt
      const isValid = await compare(pin, adminConfig.pin_hash)
      
      if (!isValid) {
        console.log('Invalid PIN attempt')
        return new Response(
          JSON.stringify({ isValid: false }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Verify admin status using secure function
      const { data: isAdmin, error: adminCheckError } = await supabaseAdmin
        .rpc('has_role', { _user_id: user.id, _role: 'admin' })

      if (adminCheckError || !isAdmin) {
        console.error('User is not an admin')
        return new Response(
          JSON.stringify({ isValid: false }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const sessionToken = crypto.randomUUID()
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

      const { error: insertError } = await supabaseAdmin
        .from('admin_sessions')
        .insert({
          user_id: user.id,
          admin_token: sessionToken,
          expires_at: expiresAt.toISOString()
        })

      if (insertError) {
        return new Response(
          JSON.stringify({ error: 'Operation failed' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ 
          isValid: true, 
          adminToken: sessionToken,
          expiresAt: expiresAt.toISOString()
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'verify-admin') {
      if (!adminToken || !validateUUID(adminToken)) {
        return new Response(
          JSON.stringify({ isAdmin: false }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const { data: session, error: sessionError } = await supabaseAdmin
        .from('admin_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('admin_token', adminToken)
        .gt('expires_at', new Date().toISOString())
        .single()

      if (sessionError || !session) {
        return new Response(
          JSON.stringify({ isAdmin: false }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Verify admin status using secure function
      const { data: isAdmin, error: adminCheckError } = await supabaseAdmin
        .rpc('has_role', { _user_id: user.id, _role: 'admin' })

      if (adminCheckError || !isAdmin) {
        console.error('User is not an admin')
        return new Response(
          JSON.stringify({ isAdmin: false }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ isAdmin: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in secure-admin-auth function:', error)
    return new Response(
      JSON.stringify({ error: 'Operation failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
