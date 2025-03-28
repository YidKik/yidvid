
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Globe } from "lucide-react";
import { translations, getTranslation, TranslationKey } from "@/utils/translations";

interface LanguageSettingsProps {
  userId: string | null;
  language: string;
  setLanguage: (lang: string) => void;
}

export const LanguageSettings = ({ userId, language, setLanguage }: LanguageSettingsProps) => {
  const t = (key: TranslationKey) => getTranslation(key);

  const handleLanguageChange = async (newLanguage: string) => {
    try {
      if (!userId) return;

      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          language: newLanguage
        });

      if (error) {
        console.error('Error updating language:', error);
        toast.error('Failed to update language preference');
        return;
      }

      setLanguage(newLanguage);
      document.documentElement.dir = newLanguage === 'yi' ? 'rtl' : 'ltr';
      toast.success('Language updated successfully');
    } catch (error) {
      console.error('Error updating language:', error);
      toast.error('Failed to update language preference');
    }
  };

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
        <Globe className="h-6 w-6" />
        {t('languageSettings')}
      </h2>
      <Card className="p-6">
        <div className="space-y-2">
          <Label htmlFor="language">{t('interfaceLanguage')}</Label>
          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="he">Hebrew</SelectItem>
              <SelectItem value="yi">Yiddish</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>
    </section>
  );
};
