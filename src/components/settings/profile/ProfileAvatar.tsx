
import { User } from "lucide-react";
import type { ProfilesTable } from "@/integrations/supabase/types/profiles";

interface ProfileAvatarProps {
  avatarUrl: string;
  displayName: string;
  username: string;
  profile: ProfilesTable["Row"];
}

export const ProfileAvatar = ({ avatarUrl, displayName, username, profile }: ProfileAvatarProps) => {
  return (
    <div className="flex items-center space-x-4">
      <div className="relative">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center overflow-hidden">
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-10 h-10 text-muted-foreground" />
          )}
        </div>
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-medium">
          {displayName || username || "Anonymous User"}
        </h3>
        <p className="text-sm text-muted-foreground">
          {profile?.email || "No email provided"}
        </p>
      </div>
    </div>
  );
};
