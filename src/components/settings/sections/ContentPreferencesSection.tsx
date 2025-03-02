
import { Card } from "@/components/ui/card";
import { ChannelSubscriptions } from "@/components/youtube/ChannelSubscriptions";
import { ChannelControl } from "@/components/youtube/ChannelPreferences";
import { PlaybackSettings } from "@/components/settings/PlaybackSettings";

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
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold text-primary/80">Content Preferences</h2>
      
      <div>
        <h3 className="text-xl font-semibold mb-4">Channel Subscriptions</h3>
        {userId ? (
          <ChannelSubscriptions userId={userId} />
        ) : (
          <Card className="p-6">
            <p className="text-muted-foreground">Please sign in to manage your subscriptions.</p>
          </Card>
        )}
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4">Channel Visibility</h3>
        <div className="p-0">
          <p className="text-muted-foreground mb-4 text-sm">
            Choose which channels you want to see in your feed. Hidden channels won't appear in your recommendations or search results.
          </p>
          <ChannelControl />
        </div>
      </div>

      <PlaybackSettings 
        autoplay={autoplay}
        setAutoplay={setAutoplay}
      />
    </div>
  );
};
