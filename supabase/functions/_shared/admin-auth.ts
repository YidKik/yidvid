import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export const adminCorsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface VerifyAdminAccessResult {
  adminClient?: ReturnType<typeof createClient>;
  userId?: string;
  hasDatabaseAdmin?: boolean;
  hasSecureAdminSession?: boolean;
  error?: string;
  status?: number;
}

export const verifyAdminAccess = async (
  authHeader: string | null,
  adminToken?: string,
): Promise<VerifyAdminAccessResult> => {
  if (!authHeader) {
    return { error: 'Missing authorization header', status: 401 };
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();

  if (userError || !user) {
    return { error: 'Unauthorized', status: 401 };
  }

  const [profileResult, roleResult, sessionResult] = await Promise.all([
    adminClient
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .maybeSingle(),
    adminClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle(),
    adminToken
      ? adminClient
          .from('admin_sessions')
          .select('user_id, expires_at')
          .eq('admin_token', adminToken)
          .eq('user_id', user.id)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);

  const hasDatabaseAdmin = profileResult.data?.is_admin === true || Boolean(roleResult.data);
  const hasSecureAdminSession = Boolean(
    adminToken &&
      sessionResult.data &&
      new Date(sessionResult.data.expires_at).getTime() > Date.now(),
  );

  if (!hasDatabaseAdmin && !hasSecureAdminSession) {
    return { error: 'Admin access required', status: 403 };
  }

  return {
    adminClient,
    userId: user.id,
    hasDatabaseAdmin,
    hasSecureAdminSession,
  };
};