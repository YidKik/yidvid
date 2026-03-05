
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export const ProfileSectionSkeleton = () => {
  const { handleLogout, isLoggingOut } = useAuth();

  const handleSignOut = async () => {
    await handleLogout();
  };

  return (
    <section className="mb-8">
      <Card className="p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center justify-center w-full py-4">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        </div>
      </Card>
    </section>
  );
};
