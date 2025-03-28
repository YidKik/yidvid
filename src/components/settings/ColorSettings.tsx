
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { getTranslation, TranslationKey } from "@/utils/translations";
import { useIsMobile } from "@/hooks/useIsMobile";

interface ColorSettingsProps {
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

export const ColorSettings = ({
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
}: ColorSettingsProps) => {
  const t = (key: TranslationKey) => getTranslation(key);
  const isMobile = useIsMobile();

  return (
    <section className={`${isMobile ? 'mb-6' : 'mb-12'}`}>
      <h2 className={`${isMobile ? 'text-lg' : 'text-2xl'} font-semibold mb-2 md:mb-4`}>{t('customizeColors')}</h2>
      <Card className={`${isMobile ? 'p-3' : 'p-6'}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="space-y-3 md:space-y-4">
            <div>
              <Label htmlFor="backgroundColor" className={`${isMobile ? 'text-sm' : ''}`}>{t('backgroundColor')}</Label>
              <div className="flex items-center gap-3 mt-1">
                <input
                  type="color"
                  id="backgroundColor"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className={`${isMobile ? 'w-16 h-8' : 'w-20 h-10'} rounded cursor-pointer`}
                />
                <span className={`${isMobile ? 'text-xs' : 'text-sm'}`}>{backgroundColor}</span>
              </div>
            </div>

            <div>
              <Label htmlFor="textColor" className={`${isMobile ? 'text-sm' : ''}`}>{t('textColor')}</Label>
              <div className="flex items-center gap-3 mt-1">
                <input
                  type="color"
                  id="textColor"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className={`${isMobile ? 'w-16 h-8' : 'w-20 h-10'} rounded cursor-pointer`}
                />
                <span className={`${isMobile ? 'text-xs' : 'text-sm'}`}>{textColor}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 md:space-y-4">
            <div>
              <Label htmlFor="buttonColor" className={`${isMobile ? 'text-sm' : ''}`}>{t('buttonColor')}</Label>
              <div className="flex items-center gap-3 mt-1">
                <input
                  type="color"
                  id="buttonColor"
                  value={buttonColor}
                  onChange={(e) => setButtonColor(e.target.value)}
                  className={`${isMobile ? 'w-16 h-8' : 'w-20 h-10'} rounded cursor-pointer`}
                />
                <span className={`${isMobile ? 'text-xs' : 'text-sm'}`}>{buttonColor}</span>
              </div>
            </div>

            <div>
              <Label htmlFor="otherColors" className={`${isMobile ? 'text-sm' : ''}`}>{t('otherColors')}</Label>
              <div className="flex items-center gap-3 mt-1">
                <input
                  type="color"
                  id="otherColors"
                  value={logoColor}
                  onChange={(e) => setLogoColor(e.target.value)}
                  className={`${isMobile ? 'w-16 h-8' : 'w-20 h-10'} rounded cursor-pointer`}
                />
                <span className={`${isMobile ? 'text-xs' : 'text-sm'}`}>{logoColor}</span>
              </div>
            </div>
          </div>

          <div className="col-span-full flex gap-3 mt-2">
            <Button onClick={saveColors} variant="default" size={isMobile ? "sm" : "default"} className={`${isMobile ? 'text-sm py-1' : ''}`}>
              {t('saveChanges')}
            </Button>
            <Button onClick={resetToDefaults} variant="outline" size={isMobile ? "sm" : "default"} className={`${isMobile ? 'text-sm py-1' : ''}`}>
              {t('resetDefaults')}
            </Button>
          </div>
        </div>
      </Card>
    </section>
  );
};
