import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type LanguageContextType = {
  language: string;
  setLanguage: (lang: string) => Promise<void>;
};

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: async () => {},
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguageState] = useState("en");

  useEffect(() => {
    // Load user's language preference on mount
    const loadLanguagePreference = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data } = await supabase
          .from("user_preferences")
          .select("language")
          .eq("user_id", session.user.id)
          .single();
        
        if (data?.language) {
          setLanguageState(data.language);
          document.documentElement.dir = data.language === "yi" ? "rtl" : "ltr";
        }
      }
    };

    loadLanguagePreference();
  }, []);

  const setLanguage = async (newLanguage: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const { error } = await supabase
        .from("user_preferences")
        .upsert({
          user_id: session.user.id,
          language: newLanguage
        }, {
          onConflict: "user_id"
        });

      if (!error) {
        setLanguageState(newLanguage);
        document.documentElement.dir = newLanguage === "yi" ? "rtl" : "ltr";
      }
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};