
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Volume2 } from "lucide-react";
import { getTranslation, TranslationKey } from "@/utils/translations";
import { usePlayback } from "@/contexts/PlaybackContext";
import { useIsMobile } from "@/hooks/use-mobile";

interface PlaybackSettingsProps {
  autoplay: boolean;
  setAutoplay: (autoplay: boolean) => void;
}

export const PlaybackSettings = ({
  autoplay,
  setAutoplay,
}: PlaybackSettingsProps) => {
  const t = (key: TranslationKey) => getTranslation(key);
  const { volume, playbackSpeed, setVolume, setPlaybackSpeed } = usePlayback();
  const { isMobile } = useIsMobile();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-2xl">
          <Volume2 className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-primary/90">Playback Settings</h3>
          <p className="text-sm text-muted-foreground">Configure video playback preferences</p>
        </div>
      </div>
      
      <div className="p-4 bg-white/70 rounded-2xl border border-primary/10 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="volume" className={`${isMobile ? 'text-sm' : ''}`}>{t('defaultVolume')} ({volume}%)</Label>
          <Slider
            id="volume"
            min={0}
            max={100}
            step={1}
            value={[volume]}
            onValueChange={(value) => setVolume(value[0])}
            className={`${isMobile ? 'h-4' : ''}`}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="playback-speed" className={`${isMobile ? 'text-sm' : ''}`}>{t('defaultPlaybackSpeed')}</Label>
          <Select value={playbackSpeed} onValueChange={setPlaybackSpeed}>
            <SelectTrigger className={`${isMobile ? 'w-[120px] h-8 text-sm' : 'w-[140px]'} bg-background border-input rounded-xl`}>
              <SelectValue placeholder="Select speed" />
            </SelectTrigger>
            <SelectContent className="bg-background border-2 border-input shadow-lg min-w-[120px] rounded-xl">
              <SelectItem value="0.25">0.25x</SelectItem>
              <SelectItem value="0.5">0.5x</SelectItem>
              <SelectItem value="0.75">0.75x</SelectItem>
              <SelectItem value="1">Normal</SelectItem>
              <SelectItem value="1.25">1.25x</SelectItem>
              <SelectItem value="1.5">1.5x</SelectItem>
              <SelectItem value="2">2x</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="autoplay" className={`${isMobile ? 'text-sm' : ''}`}>{t('autoplay')}</Label>
            <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
              {t('autoplayNextVideo')}
            </p>
          </div>
          <Switch
            id="autoplay"
            checked={autoplay}
            onCheckedChange={setAutoplay}
          />
        </div>
      </div>
    </div>
  );
};
