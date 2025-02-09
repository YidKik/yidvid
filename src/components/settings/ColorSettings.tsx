
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { getTranslation, TranslationKey } from "@/utils/translations";

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

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-semibold mb-4">{t('customizeColors')}</h2>
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="backgroundColor">{t('backgroundColor')}</Label>
              <div className="flex items-center gap-4">
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
              <div className="flex items-center gap-4">
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

          <div className="space-y-4">
            <div>
              <Label htmlFor="buttonColor">{t('buttonColor')}</Label>
              <div className="flex items-center gap-4">
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
              <div className="flex items-center gap-4">
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

          <div className="col-span-full flex gap-4">
            <Button onClick={saveColors} variant="default">
              {t('saveChanges')}
            </Button>
            <Button onClick={resetToDefaults} variant="outline">
              {t('resetDefaults')}
            </Button>
          </div>
        </div>
      </Card>
    </section>
  );
};
