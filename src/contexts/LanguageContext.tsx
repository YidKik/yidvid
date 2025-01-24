import { createContext, useContext } from "react";

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
  // Since we only support English now, we don't need to manage language state
  const language = "en";
  const setLanguage = async () => {
    // No-op since we only support English
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};