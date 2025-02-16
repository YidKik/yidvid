
export interface ProfilesTable {
  Row: {
    created_at: string;
    email: string;
    id: string;
    is_admin: boolean | null;
    updated_at: string;
    display_name: string | null;
    username: string | null;
    avatar_url: string | null;
    welcome_name: string | null;
  };
  Insert: {
    created_at?: string;
    email: string;
    id: string;
    is_admin?: boolean | null;
    updated_at?: string;
    display_name?: string | null;
    username?: string | null;
    avatar_url?: string | null;
    welcome_name?: string | null;
  };
  Update: {
    created_at?: string;
    email?: string;
    id?: string;
    is_admin?: boolean | null;
    updated_at?: string;
    display_name?: string | null;
    username?: string | null;
    avatar_url?: string | null;
    welcome_name?: string | null;
  };
  Relationships: [];
}
