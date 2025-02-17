
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { ProfilesTable } from "@/integrations/supabase/types/profiles";

interface ProfileInfoProps {
  profile: ProfilesTable["Row"];
}

export const ProfileInfo = ({ profile }: ProfileInfoProps) => {
  const copyUserId = () => {
    if (profile?.id) {
      navigator.clipboard.writeText(profile.id);
      toast.success("User ID copied to clipboard");
    }
  };

  const copyUsername = () => {
    if (profile?.username) {
      navigator.clipboard.writeText(profile.username);
      toast.success("Username copied to clipboard");
    }
  };

  return (
    <div className="mt-4 space-y-4 w-full">
      <div className="flex items-center justify-between p-4 bg-muted rounded-lg min-h-[80px]">
        <div className="flex-1 mr-4">
          <p className="text-sm font-medium mb-1">User ID</p>
          <p className="text-xs text-muted-foreground break-all">
            {profile?.id || "No ID available"}
          </p>
        </div>
        {profile?.id && (
          <Button
            variant="ghost"
            size="icon"
            onClick={copyUserId}
            className="h-8 w-8 flex-shrink-0"
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
      {profile?.username && (
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div className="flex-1 mr-4">
            <p className="text-sm font-medium mb-1">Username</p>
            <p className="text-xs text-muted-foreground break-all">
              {profile.username}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={copyUsername}
            className="h-8 w-8 flex-shrink-0"
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
};
