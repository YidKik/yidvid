import { ColorSettings } from "@/components/settings/ColorSettings";
import { useIsMobile } from "@/hooks/use-mobile";
import { Palette } from "lucide-react";

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
    <div style={{ fontFamily: "'Quicksand', 'Rubik', sans-serif" }}>
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gray-200">
        <Palette size={18} className="text-yellow-600" />
        <h2 className="text-lg font-bold text-gray-900">Appearance</h2>
      </div>
      
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
          <h3 className="text-sm font-semibold text-gray-800">Theme Colors</h3>
        </div>
        <p className="text-xs text-gray-500 mb-4">
          Customize your viewing experience with personalized colors.
        </p>
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
    </div>
  );
};
