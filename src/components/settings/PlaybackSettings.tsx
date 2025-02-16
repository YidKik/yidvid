
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Volume2 } from "lucide-react";
import { getTranslation, TranslationKey } from "@/utils/translations";
import { usePlayback } from "@/contexts/PlaybackContext";

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

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
        <Volume2 className="h-6 w-6" />
        {t('playbackSettings')}
      </h2>
      <Card className="p-6 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="volume">{t('defaultVolume')} ({volume}%)</Label>
          <Slider
            id="volume"
            min={0}
            max={100}
            step={1}
            value={[volume]}
            onValueChange={(value) => setVolume(value[0])}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="playback-speed">{t('defaultPlaybackSpeed')}</Label>
          <Select value={playbackSpeed} onValueChange={setPlaybackSpeed}>
            <SelectTrigger className="w-[140px] bg-background border-input">
              <SelectValue placeholder="Select speed" />
            </SelectTrigger>
            <SelectContent className="bg-background border-2 border-input shadow-lg min-w-[140px]">
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
            <Label htmlFor="autoplay">{t('autoplay')}</Label>
            <p className="text-sm text-muted-foreground">
              {t('autoplayNextVideo')}
            </p>
          </div>
          <Switch
            id="autoplay"
            checked={autoplay}
            onCheckedChange={setAutoplay}
          />
        </div>
      </Card>
    </section>
  );
};
