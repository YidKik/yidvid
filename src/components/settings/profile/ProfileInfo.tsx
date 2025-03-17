
import type { ProfilesTable } from "@/integrations/supabase/types/profiles";
import { ProfileField } from "./ProfileField";

interface ProfileInfoProps {
  profile: ProfilesTable["Row"];
}

export const ProfileInfo = ({ profile }: ProfileInfoProps) => {
  return (
    <div className="mt-4 space-y-4 w-full">
      <ProfileField 
        label="User ID" 
        value={profile?.id} 
        copyLabel="User ID"
      />
      
      {profile?.username && (
        <ProfileField 
          label="Username" 
          value={profile.username} 
          copyLabel="Username"
        />
      )}
    </div>
  );
};
