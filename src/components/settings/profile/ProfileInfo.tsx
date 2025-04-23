
import { format } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";
import type { ProfilesTable } from "@/integrations/supabase/types/profiles";
import { ProfileField } from "./ProfileField";

interface ProfileInfoProps {
  profile: ProfilesTable["Row"] | null;
}

export const ProfileInfo = ({ profile }: ProfileInfoProps) => {
  const { isMobile } = useIsMobile();
  
  // Handle null profile by providing default values
  const username = profile?.username || "";
  const display_name = profile?.display_name || "User";
  const email = profile?.email || "";
  const created_at = profile?.created_at || null;
  
  const memberSince = created_at 
    ? format(new Date(created_at), "MMMM d, yyyy")
    : "Unknown";

  return (
    <div className="flex-1 min-w-0">
      <h3 className={`${isMobile ? 'text-xs font-semibold mb-0.5 truncate' : 'text-xl font-semibold mb-1'}`}>
        {display_name || username || "User"}
      </h3>
      
      <div className={`${isMobile ? 'space-y-0' : 'space-y-0.5'}`}>
        <ProfileField 
          label="Email" 
          value={email} 
          isMobile={isMobile}
        />
        <ProfileField 
          label="Username" 
          value={username} 
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
