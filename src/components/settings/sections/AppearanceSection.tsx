
import { ColorSettings } from "@/components/settings/ColorSettings";

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
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold text-primary/80">Appearance</h2>
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
  );
};
