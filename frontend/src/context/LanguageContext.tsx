"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { getStoredProfile, saveProfile } from "@/lib/userStore";
import { getTranslation, TranslationDict } from "@/lib/translations";

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: TranslationDict;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "hi",
  setLanguage: () => {},
  t: getTranslation("hi"),
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<string>("hi");

  useEffect(() => {
    const profile = getStoredProfile();
    if (profile && profile.language) {
      setLanguageState(profile.language);
    }
  }, []);

  const setLanguage = (lang: string) => {
    setLanguageState(lang);
    const profile = getStoredProfile();
    const updated = { ...profile, language: lang };
    saveProfile(updated);
  };

  const t = getTranslation(language);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
