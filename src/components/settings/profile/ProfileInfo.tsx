
import { format } from "date-fns";
import { useIsMobile } from "@/hooks/useIsMobile";
import type { ProfilesTable } from "@/integrations/supabase/types/profiles";
import { ProfileField } from "./ProfileField";

interface ProfileInfoProps {
  profile: ProfilesTable["Row"];
}

export const ProfileInfo = ({ profile }: ProfileInfoProps) => {
  const isMobile = useIsMobile();
  const { username, display_name, email, created_at } = profile;
  
  const memberSince = created_at 
    ? format(new Date(created_at), "MMMM d, yyyy")
    : "Unknown";

  return (
    <div className={`${isMobile ? 'w-full' : ''}`}>
      <h3 className={`${isMobile ? 'text-sm font-semibold mb-0.5' : 'text-xl font-semibold mb-1'}`}>
        {display_name || username || "User"}
      </h3>
      
      <div className={`${isMobile ? 'space-y-0' : 'space-y-0.5'}`}>
        <ProfileField 
          label="Email" 
          value={email || ""} 
          isMobile={isMobile}
        />
        
        <ProfileField 
          label="Username" 
          value={username || ""} 
          isMobile={isMobile}
        />
        
        <ProfileField 
          label="Member since" 
          value={memberSince} 
          isMobile={isMobile}
        />
      </div>
    </div>
  );
};
