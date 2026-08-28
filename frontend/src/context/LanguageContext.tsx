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

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: {
      translate?: {
        TranslateElement?: new (options: any, elementId: string) => void;
      };
    };
  }
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<string>("hi");

  // Sync translation cookie
  const syncTranslationEngine = (lang: string) => {
    try {
      const cookieValue = `/auto/${lang}`;
      document.cookie = `googtrans=${cookieValue}; path=/; domain=${window.location.hostname}`;
      document.cookie = `googtrans=${cookieValue}; path=/;`;
      
      const combo = document.querySelector<HTMLSelectElement>(".goog-te-combo");
      if (combo && combo.value !== lang) {
        combo.value = lang;
        combo.dispatchEvent(new Event("change"));
      }
    } catch (err) {
      console.warn("Translation sync error:", err);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    window.googleTranslateElementInit = () => {
      try {
        if (window.google?.translate?.TranslateElement) {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: "en",
              includedLanguages: "en,hi,mr,pa,gu,te,ta,kn,ml,bn,or,as",
              autoDisplay: false,
            },
            "google_translate_element"
          );
          const profile = getStoredProfile();
          const activeLang = profile?.language || "hi";
          syncTranslationEngine(activeLang);
        }
      } catch (_) {}
    };

    if (!document.getElementById("google-translate-script")) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    }

    const profile = getStoredProfile();
    if (profile && profile.language) {
      setLanguageState(profile.language);
      syncTranslationEngine(profile.language);
    } else {
      syncTranslationEngine("hi");
    }
  }, []);

  const setLanguage = (lang: string) => {
    setLanguageState(lang);
    const profile = getStoredProfile();
    const updated = { ...profile, language: lang };
    saveProfile(updated);

    try {
      const cookieValue = `/auto/${lang}`;
      document.cookie = `googtrans=${cookieValue}; path=/; domain=${window.location.hostname}`;
      document.cookie = `googtrans=${cookieValue}; path=/;`;

      const combo = document.querySelector<HTMLSelectElement>(".goog-te-combo");
      if (combo) {
        combo.value = lang;
        combo.dispatchEvent(new Event("change"));
      }
    } catch (_) {}
  };

  const t = getTranslation(language);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      <div id="google_translate_element" style={{ display: "none" }} aria-hidden="true" className="notranslate" translate="no" />
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
