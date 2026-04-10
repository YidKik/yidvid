
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { adminCorsHeaders, verifyAdminAccess } from '../_shared/admin-auth.ts';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: adminCorsHeaders });
  }

  try {
    const { email, adminToken } = await req.json();

    const auth = await verifyAdminAccess(req.headers.get('Authorization'), adminToken);
    if (auth.error || !auth.adminClient) {
      return new Response(
        JSON.stringify({ error: auth.error }),
        { headers: { ...adminCorsHeaders, 'Content-Type': 'application/json' }, status: auth.status ?? 401 }
      );
    }
    
    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { headers: { ...adminCorsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Find the user by email
    const { data: userData, error: userError } = await auth.adminClient
      .from('profiles')
      .select('*')
      .eq('email', email)
      .maybeSingle();
    
    if (userError) {
      console.error('Error finding user:', userError);
      return new Response(
        JSON.stringify({ error: userError.message }),
        { headers: { ...adminCorsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    if (!userData) {
      return new Response(
        JSON.stringify({ error: 'User not found with the provided email' }),
        { headers: { ...adminCorsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // Update the user's admin status
    const { data, error } = await auth.adminClient
      .from('profiles')
      .update({ is_admin: true })
      .eq('id', userData.id)
      .select();
    
    if (error) {
      console.error('Error updating admin status:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { headers: { ...adminCorsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const { error: roleError } = await auth.adminClient
      .from('user_roles')
      .upsert({ user_id: userData.id, role: 'admin' }, { onConflict: 'user_id,role' });

    if (roleError) {
      console.error('Error updating user_roles:', roleError);
      return new Response(
        JSON.stringify({ error: roleError.message }),
        { headers: { ...adminCorsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `User ${email} has been granted admin privileges`,
        data
      }),
      { headers: { ...adminCorsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...adminCorsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
