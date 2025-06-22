
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
    <div className="space-y-6 md:space-y-8">
      <h2 className={`${isMobile ? 'text-lg' : 'text-2xl'} font-semibold text-primary/80`}>Content Preferences</h2>
      
      <div>
        <h3 className={`${isMobile ? 'text-base' : 'text-xl'} font-semibold mb-3 md:mb-4`}>Channel Subscriptions</h3>
        <ChannelSubscriptions />
      </div>

      <div>
        <h3 className={`${isMobile ? 'text-base' : 'text-xl'} font-semibold mb-3 md:mb-4`}>Channel Visibility</h3>
        <div className="p-0">
          <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground mb-3 md:mb-4`}>
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
  );
};
