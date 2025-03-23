
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
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
          <div className="flex items-center gap-4">
            <Skeleton className="w-20 h-20 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-60" />
            </div>
          </div>
          <div className="mt-4 md:mt-0">
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="flex items-center justify-center gap-2"
              disabled={isLoggingOut}
            >
              <LogOut className="h-4 w-4" />
              <span>{isLoggingOut ? "Signing Out..." : "Sign Out"}</span>
            </Button>
          </div>
        </div>
      </Card>
    </section>
  );
};
