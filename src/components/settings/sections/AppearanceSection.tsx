
import { ColorSettings } from "@/components/settings/ColorSettings";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card } from "@/components/ui/card";

interface AppearanceSectionProps {
  backgroundColor: string;
  setBackgroundColor: (color: string) => void;
  textColor: string;
  setTextColor: (color: string) => void;
  buttonColor: string;
  setButtonColor: (color: string) => void;
  logoColor: string;
  setLogoColor: (color: string) => void;
  saveColors: () => Promise<void>;
  resetToDefaults: () => Promise<void>;
}

export const AppearanceSection = ({
  backgroundColor,
  setBackgroundColor,
  textColor,
  setTextColor,
  buttonColor,
  setButtonColor,
  logoColor,
  setLogoColor,
  saveColors,
  resetToDefaults,
}: AppearanceSectionProps) => {
  const { isMobile } = useIsMobile();
  
  return (
    <Card className="w-full border-2 border-primary/20 shadow-lg rounded-3xl bg-gradient-to-br from-card to-primary/5">
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-2xl">
            <div className="w-6 h-6 text-primary">🎨</div>
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-primary">Appearance</h2>
            <p className="text-sm text-muted-foreground">Customize colors and theme settings</p>
          </div>
        </div>
        <ColorSettings 
          backgroundColor={backgroundColor}
          setBackgroundColor={setBackgroundColor}
          textColor={textColor}
          setTextColor={setTextColor}
          buttonColor={buttonColor}
          setButtonColor={setButtonColor}
          logoColor={logoColor}
          setLogoColor={setLogoColor}
          saveColors={saveColors}
          resetToDefaults={resetToDefaults}
        />
      </div>
    </Card>
  );
};
