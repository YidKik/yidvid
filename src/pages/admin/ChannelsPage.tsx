
import { YouTubeChannelsSection } from "@/components/dashboard/YouTubeChannelsSection";
import { BackButton } from "@/components/navigation/BackButton";
import { ChannelsCounter } from "@/components/dashboard/youtube/ChannelsCounter";
import { useSessionManager } from "@/hooks/useSessionManager";
import { useEffect, useState } from "react";
import { DashboardLoading } from "@/components/dashboard/DashboardLoading";
import { NonAdminContent } from "@/components/dashboard/NonAdminContent";

export default function ChannelsPage() {
  const { session, isLoading: authLoading, isAuthenticated, profile } = useSessionManager();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyAdminStatus = async () => {
      if (!session || authLoading) {
        return;
      }

      try {
        if (profile?.is_admin) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Admin check failed:", error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    verifyAdminStatus();
  }, [session, profile, authLoading]);

  if (authLoading || isLoading) {
    return <DashboardLoading />;
  }

  if (isAdmin === false) {
    return <NonAdminContent />;
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <BackButton />
        <ChannelsCounter />
      </div>
      <h1 className="text-3xl font-bold">YouTube Channels Management</h1>
      <p className="text-muted-foreground">Add channels or fetch all videos from all channels</p>
      <YouTubeChannelsSection />
    </div>
  );
}
