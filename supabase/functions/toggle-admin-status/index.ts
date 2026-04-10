
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { adminCorsHeaders, verifyAdminAccess } from '../_shared/admin-auth.ts';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: adminCorsHeaders });
  }

  try {
    const { userId, newStatus, adminToken } = await req.json();

    const auth = await verifyAdminAccess(req.headers.get('Authorization'), adminToken);
    if (auth.error || !auth.adminClient) {
      return new Response(
        JSON.stringify({ error: auth.error }),
        { headers: { ...adminCorsHeaders, 'Content-Type': 'application/json' }, status: auth.status ?? 401 }
      );
    }
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'userId is required' }),
        { headers: { ...adminCorsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    if (typeof newStatus !== 'boolean') {
      return new Response(
        JSON.stringify({ error: 'newStatus must be a boolean' }),
        { headers: { ...adminCorsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    const { data, error } = await auth.adminClient
      .from('profiles')
      .update({ is_admin: newStatus })
      .eq('id', userId)
      .select();
    
    if (error) {
      console.error('Error updating admin status:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { headers: { ...adminCorsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    if (newStatus) {
      const { error: roleError } = await auth.adminClient
        .from('user_roles')
        .upsert({ user_id: userId, role: 'admin' }, { onConflict: 'user_id,role' });

      if (roleError) {
        console.error('Error granting admin role:', roleError);
        return new Response(
          JSON.stringify({ error: roleError.message }),
          { headers: { ...adminCorsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
    } else {
      const { error: roleError } = await auth.adminClient
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', 'admin');

      if (roleError) {
        console.error('Error removing admin role:', roleError);
        return new Response(
          JSON.stringify({ error: roleError.message }),
          { headers: { ...adminCorsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `User admin status updated to ${newStatus}`,
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
