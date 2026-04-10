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

    if (!targetUserId || typeof targetUserId !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Missing userId' }),
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

    // Prevent self-deletion
    if (targetUserId === auth.userId) {
      return new Response(
        JSON.stringify({ error: 'Cannot delete your own account from admin panel' }),
        { headers: { ...adminCorsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Clean up related data first (using service role client)
    const tables = [
      { table: 'video_history', column: 'user_id' },
      { table: 'user_video_interactions', column: 'user_id' },
      { table: 'channel_subscriptions', column: 'user_id' },
      { table: 'video_notifications', column: 'user_id' },
      { table: 'user_preferences', column: 'user_id' },
      { table: 'user_analytics', column: 'user_id' },
      { table: 'email_preferences', column: 'user_id' },
      { table: 'user_roles', column: 'user_id' },
      { table: 'video_comments', column: 'user_id' },
      { table: 'hidden_channels', column: 'user_id' },
      { table: 'parental_locks', column: 'user_id' },
      { table: 'admin_sessions', column: 'user_id' },
      { table: 'video_playlists', column: 'user_id' },
      { table: 'profiles', column: 'id' },
    ];

    for (const { table, column } of tables) {
      const { error } = await auth.adminClient
        .from(table)
        .delete()
        .eq(column, targetUserId);
      if (error) {
        console.error(`Error cleaning up ${table}:`, error.message);
      }
    }

    // Delete user from auth
    const { error: deleteError } = await auth.adminClient.auth.admin.deleteUser(targetUserId);

    if (deleteError) {
      return new Response(
        JSON.stringify({ error: deleteError.message }),
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