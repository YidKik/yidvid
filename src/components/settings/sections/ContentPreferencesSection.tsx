import { useEffect, useState } from "react";
import { ChannelSubscriptions } from "@/components/youtube/ChannelSubscriptions";
import { ChannelControl } from "@/components/youtube/ChannelPreferences";
import { PlaybackSettings } from "@/components/settings/PlaybackSettings";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import Auth from "@/pages/Auth";
import { Video, Eye, Play } from "lucide-react";

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
  
  return (
    <div style={{ fontFamily: "'Quicksand', 'Rubik', sans-serif" }}>
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gray-200">
        <Video size={18} className="text-yellow-600" />
        <h2 className="text-lg font-bold text-gray-900">Content Preferences</h2>
      </div>
      
      <div className="space-y-6">
        {/* Channel Subscriptions */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
            <h3 className="text-sm font-semibold text-gray-800">Channel Subscriptions</h3>
          </div>
          <ChannelSubscriptions />
        </div>

        {/* Channel Visibility */}
        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <Eye size={14} className="text-gray-500" />
            <h3 className="text-sm font-semibold text-gray-800">Channel Visibility</h3>
          </div>
          <p className="text-xs text-gray-500 mb-3">
            Choose which channels appear in your feed. Hidden channels won't show in recommendations.
          </p>
          <ChannelControl />
        </div>

        {/* Playback Settings */}
        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <Play size={14} className="text-gray-500" />
            <h3 className="text-sm font-semibold text-gray-800">Playback</h3>
          </div>
          <PlaybackSettings 
            autoplay={autoplay}
            setAutoplay={setAutoplay}
          />
        </div>
      </div>
      
      <Auth isOpen={isAuthOpen} onOpenChange={setIsAuthOpen} />
    </div>
  );
};
