
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { ChannelSubscriptions } from "@/components/youtube/ChannelSubscriptions";
import { ChannelControl } from "@/components/youtube/ChannelPreferences";
import { PlaybackSettings } from "@/components/settings/PlaybackSettings";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import Auth from "@/pages/Auth";

interface ContentPreferencesSectionProps {
  userId: string | null;
  autoplay: boolean;
  setAutoplay: (autoplay: boolean) => void;
}

export const ContentPreferencesSection = ({
  userId,
  autoplay,
  setAutoplay,
}: ContentPreferencesSectionProps) => {
  const isMobile = useIsMobile();
  const { isAuthenticated, user, isLoading: authLoading } = useUnifiedAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Log authentication state when component mounts
  useEffect(() => {
    console.log("ContentPreferencesSection - Auth state:", {
      isAuthenticated,
      userId: user?.id,
      userEmail: user?.email || "No email",
      authLoading
    });
  }, [isAuthenticated, user, authLoading]);
  
  return (
    <Card className="w-full border-2 border-primary/20 shadow-lg rounded-3xl bg-gradient-to-br from-white to-primary/5">
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-2xl">
            <div className="w-6 h-6 text-primary">🎬</div>
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-primary">Content Preferences</h2>
            <p className="text-sm text-muted-foreground">Manage your channels and playback settings</p>
          </div>
        </div>
        
        <div>
          <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold mb-3 text-primary/90`}>Channel Subscriptions</h3>
          <ChannelSubscriptions />
        </div>

        <div>
          <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold mb-3 text-primary/90`}>Channel Visibility</h3>
          <div className="space-y-3">
            <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
              Choose which channels you want to see in your feed. Hidden channels won't appear in your recommendations or search results.
            </p>
            <ChannelControl />
          </div>
        </div>

        <PlaybackSettings 
          autoplay={autoplay}
          setAutoplay={setAutoplay}
        />
        
        {/* Auth dialog */}
        <Auth isOpen={isAuthOpen} onOpenChange={setIsAuthOpen} />
      </div>
    </Card>
  );
};
