
import { User } from "lucide-react";
import type { ProfilesTable } from "@/integrations/supabase/types/profiles";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface ProfileAvatarProps {
  avatarUrl: string;
  displayName: string;
  username: string;
  profile: ProfilesTable["Row"];
}

export const ProfileAvatar = ({ avatarUrl, displayName, username, profile }: ProfileAvatarProps) => {
  // Create initials from display name or username
  const getInitials = () => {
    if (displayName) {
      return displayName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    } else if (username) {
      return username.substring(0, 2).toUpperCase();
    } else if (profile?.email) {
      return profile.email.substring(0, 2).toUpperCase();
    }
    return "U";
  };

  return (
    <div className="flex items-center space-x-4">
      <div className="relative">
        <Avatar className="w-20 h-20">
          {avatarUrl ? (
            <AvatarImage src={avatarUrl} alt={displayName || "Profile"} />
          ) : (
            <AvatarFallback 
              className="bg-primary/10 text-primary text-2xl"
              delayMs={600}
            >
              {getInitials()}
            </AvatarFallback>
          )}
        </Avatar>
      </div>
    </div>
  );
};
