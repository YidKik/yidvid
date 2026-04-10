import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { adminCorsHeaders, verifyAdminAccess } from '../_shared/admin-auth.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: adminCorsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const page = Math.max(1, Number(body.page ?? 1));
    const perPage = Math.min(1000, Math.max(1, Number(body.perPage ?? 1000)));
    const adminToken = typeof body.adminToken === 'string' ? body.adminToken : undefined;

    const auth = await verifyAdminAccess(req.headers.get('Authorization'), adminToken);
    if (auth.error || !auth.adminClient) {
      return new Response(
        JSON.stringify({ error: auth.error }),
        { headers: { ...adminCorsHeaders, 'Content-Type': 'application/json' }, status: auth.status ?? 401 }
      );
    }

    const { data: authUsersData, error: authUsersError } = await auth.adminClient.auth.admin.listUsers({
      page,
      perPage,
    });

    if (authUsersError) {
      return new Response(
        JSON.stringify({ error: authUsersError.message }),
        { headers: { ...adminCorsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const authUsers = authUsersData?.users ?? [];
    const userIds = authUsers.map((user) => user.id);

    let profiles: Array<Record<string, unknown>> = [];
    let adminRoles: Array<{ user_id: string; role: string }> = [];

    if (userIds.length > 0) {
      const [profilesResult, rolesResult] = await Promise.all([
        auth.adminClient
          .from('profiles')
          .select('id, email, is_admin, name, display_name, username, avatar_url, created_at, updated_at, user_type, child_name, email_notifications, welcome_name, welcome_popup_shown')
          .in('id', userIds),
        auth.adminClient
          .from('user_roles')
          .select('user_id, role')
          .eq('role', 'admin')
          .in('user_id', userIds),
      ]);

      if (profilesResult.error) {
        console.error('Error fetching profiles:', profilesResult.error);
        return new Response(
          JSON.stringify({ error: profilesResult.error.message }),
          { headers: { ...adminCorsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }

      if (rolesResult.error) {
        console.error('Error fetching user roles:', rolesResult.error);
        return new Response(
          JSON.stringify({ error: rolesResult.error.message }),
          { headers: { ...adminCorsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }

      profiles = profilesResult.data ?? [];
      adminRoles = rolesResult.data ?? [];
    }

    const profileMap = new Map(profiles.map((profile) => [profile.id as string, profile]));
    const adminRoleSet = new Set(adminRoles.map((entry) => entry.user_id));

    const users = authUsers
      .map((authUser) => {
        const profile = profileMap.get(authUser.id);
        const userMetadata = (authUser.user_metadata ?? {}) as Record<string, unknown>;
        const profileCreatedAt = typeof profile?.created_at === 'string' ? profile.created_at : null;
        const createdAt = profileCreatedAt ?? authUser.created_at ?? new Date().toISOString();

        return {
          id: authUser.id,
          email: (typeof profile?.email === 'string' ? profile.email : authUser.email) ?? '',
          is_admin:
            profile?.is_admin === true ||
            adminRoleSet.has(authUser.id) ||
            authUser.app_metadata?.role === 'admin',
          name: (profile?.name as string | null | undefined) ?? null,
          display_name:
            (profile?.display_name as string | null | undefined) ??
            (typeof userMetadata.full_name === 'string' ? userMetadata.full_name : null),
          username:
            (profile?.username as string | null | undefined) ??
            (typeof userMetadata.username === 'string' ? userMetadata.username : null),
          avatar_url:
            (profile?.avatar_url as string | null | undefined) ??
            (typeof userMetadata.avatar_url === 'string' ? userMetadata.avatar_url : null),
          created_at: createdAt,
          updated_at:
            (typeof profile?.updated_at === 'string' ? profile.updated_at : null) ?? createdAt,
          user_type: (profile?.user_type as string | null | undefined) ?? null,
          child_name: (profile?.child_name as string | null | undefined) ?? null,
          email_notifications:
            (profile?.email_notifications as boolean | null | undefined) ?? null,
          welcome_name: (profile?.welcome_name as string | null | undefined) ?? null,
          welcome_popup_shown:
            (profile?.welcome_popup_shown as boolean | null | undefined) ?? null,
        };
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return new Response(
      JSON.stringify({ users, total: users.length, page, perPage }),
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
