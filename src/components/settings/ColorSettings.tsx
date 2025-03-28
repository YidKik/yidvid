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
        <div className="space-y-4">
          {isMobile ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="backgroundColor" className="text-xs mb-1 block">{t('backgroundColor')}</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      id="backgroundColor"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="w-6 h-6 p-0 border-0 rounded-sm cursor-pointer"
                    />
                    <span className="text-xs truncate">{backgroundColor}</span>
                  </div>
                </div>
                <div>
                  <Label htmlFor="textColor" className="text-xs mb-1 block">{t('textColor')}</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      id="textColor"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-6 h-6 p-0 border-0 rounded-sm cursor-pointer"
                    />
                    <span className="text-xs truncate">{textColor}</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="buttonColor" className="text-xs mb-1 block">{t('buttonColor')}</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      id="buttonColor"
                      value={buttonColor}
                      onChange={(e) => setButtonColor(e.target.value)}
                      className="w-6 h-6 p-0 border-0 rounded-sm cursor-pointer"
                    />
                    <span className="text-xs truncate">{buttonColor}</span>
                  </div>
                </div>
                <div>
                  <Label htmlFor="otherColors" className="text-xs mb-1 block">{t('otherColors')}</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      id="otherColors"
                      value={logoColor}
                      onChange={(e) => setLogoColor(e.target.value)}
                      className="w-6 h-6 p-0 border-0 rounded-sm cursor-pointer"
                    />
                    <span className="text-xs truncate">{logoColor}</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-3 md:space-y-4">
                <div>
                  <Label htmlFor="backgroundColor">{t('backgroundColor')}</Label>
                  <div className="flex items-center gap-3 mt-1">
                    <input
                      type="color"
                      id="backgroundColor"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="w-20 h-10 rounded cursor-pointer"
                    />
                    <span className="text-sm">{backgroundColor}</span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="textColor">{t('textColor')}</Label>
                  <div className="flex items-center gap-3 mt-1">
                    <input
                      type="color"
                      id="textColor"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-20 h-10 rounded cursor-pointer"
                    />
                    <span className="text-sm">{textColor}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 md:space-y-4">
                <div>
                  <Label htmlFor="buttonColor">{t('buttonColor')}</Label>
                  <div className="flex items-center gap-3 mt-1">
                    <input
                      type="color"
                      id="buttonColor"
                      value={buttonColor}
                      onChange={(e) => setButtonColor(e.target.value)}
                      className="w-20 h-10 rounded cursor-pointer"
                    />
                    <span className="text-sm">{buttonColor}</span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="otherColors">{t('otherColors')}</Label>
                  <div className="flex items-center gap-3 mt-1">
                    <input
                      type="color"
                      id="otherColors"
                      value={logoColor}
                      onChange={(e) => setLogoColor(e.target.value)}
                      className="w-20 h-10 rounded cursor-pointer"
                    />
                    <span className="text-sm">{logoColor}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2 mt-3">
            <Button onClick={saveColors} variant="default" size={isMobile ? "sm" : "default"} className={`${isMobile ? 'text-xs h-7 px-2' : ''}`}>
              {t('saveChanges')}
            </Button>
            <Button onClick={resetToDefaults} variant="outline" size={isMobile ? "sm" : "default"} className={`${isMobile ? 'text-xs h-7 px-2' : ''}`}>
              {t('resetDefaults')}
            </Button>
          </div>
        </div>
      </Card>
    </section>
  );
};
