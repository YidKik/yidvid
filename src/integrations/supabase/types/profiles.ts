export interface ProfilesTable {
  Row: {
    created_at: string;
    email: string;
    id: string;
    is_admin: boolean | null;
    updated_at: string;
  };
  Insert: {
    created_at?: string;
    email: string;
    id: string;
    is_admin?: boolean | null;
    updated_at?: string;
  };
  Update: {
    created_at?: string;
    email?: string;
    id?: string;
    is_admin?: boolean | null;
    updated_at?: string;
  };
  Relationships: [];
}