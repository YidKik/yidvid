
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
    <div className="mt-4 space-y-4">
      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
        <div>
          <p className="text-sm font-medium">User ID</p>
          <p className="text-xs text-muted-foreground">
            {profile?.id || "No ID available"}
          </p>
        </div>
        {profile?.id && (
          <Button
            variant="ghost"
            size="icon"
            onClick={copyUserId}
          >
            <Copy className="w-4 h-4" />
          </Button>
        )}
      </div>
      {profile?.username && (
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div>
            <p className="text-sm font-medium">Username</p>
            <p className="text-xs text-muted-foreground">
              {profile.username}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={copyUsername}
          >
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
