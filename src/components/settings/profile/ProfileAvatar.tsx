
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import { useIsMobile } from "@/hooks/useIsMobile";
import type { ProfilesTable } from "@/integrations/supabase/types/profiles";

interface ProfileAvatarProps {
  avatarUrl: string;
  displayName: string;
  username: string;
  profile: ProfilesTable["Row"];
}

export const ProfileAvatar = ({
  avatarUrl,
  displayName,
  username,
}: ProfileAvatarProps) => {
  const [isHovering, setIsHovering] = useState(false);
  const isMobile = useIsMobile();
  
  const initials = displayName
    ? displayName.split(" ").map((n) => n[0]).join("").toUpperCase()
    : username
      ? username[0].toUpperCase()
      : "U";

  const handleEditAvatar = () => {
    // Avatar editing functionality would go here
    console.log("Edit avatar clicked");
  };

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <Avatar className={`${isMobile ? 'h-12 w-12' : 'h-20 w-20'} border-2 border-primary/20`}>
        <AvatarImage src={avatarUrl} alt={displayName || username} />
        <AvatarFallback className="bg-primary/10 text-primary">
          {initials}
        </AvatarFallback>
      </Avatar>
      
      {isHovering && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute inset-0 bg-black/40 hover:bg-black/50 rounded-full flex items-center justify-center text-white"
          onClick={handleEditAvatar}
        >
          <Camera className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
};
