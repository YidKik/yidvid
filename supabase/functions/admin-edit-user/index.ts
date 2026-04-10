import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { adminCorsHeaders, verifyAdminAccess } from '../_shared/admin-auth.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: adminCorsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const targetUserId = body.userId;
    const adminToken = typeof body.adminToken === 'string' ? body.adminToken : undefined;
    const updates: Record<string, unknown> = {};

    if (!targetUserId || typeof targetUserId !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Missing userId' }),
        { headers: { ...adminCorsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Only allow specific fields to be updated
    if (typeof body.display_name === 'string') updates.display_name = body.display_name.trim();
    if (typeof body.username === 'string') updates.username = body.username.trim();
    if (typeof body.name === 'string') updates.name = body.name.trim();

    if (Object.keys(updates).length === 0) {
      return new Response(
        JSON.stringify({ error: 'No valid fields to update' }),
        { headers: { ...adminCorsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const auth = await verifyAdminAccess(req.headers.get('Authorization'), adminToken);
    if (auth.error || !auth.adminClient) {
      return new Response(
        JSON.stringify({ error: auth.error }),
        { headers: { ...adminCorsHeaders, 'Content-Type': 'application/json' }, status: auth.status ?? 401 }
      );
    }

    updates.updated_at = new Date().toISOString();

    const { error: updateError } = await auth.adminClient
      .from('profiles')
      .update(updates)
      .eq('id', targetUserId);

    if (updateError) {
      return new Response(
        JSON.stringify({ error: updateError.message }),
        { headers: { ...adminCorsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
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