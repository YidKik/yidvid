export interface ProfilesTable {
  Row: {
    created_at: string;
    email: string;
    id: string;
    is_admin: boolean | null;
    updated_at: string;
    name: string | null;
  };
  Insert: {
    created_at?: string;
    email: string;
    id: string;
    is_admin?: boolean | null;
    updated_at?: string;
    name?: string | null;
  };
  Update: {
    created_at?: string;
    email?: string;
    id?: string;
    is_admin?: boolean | null;
    updated_at?: string;
    name?: string | null;
  };
  Relationships: [];
}