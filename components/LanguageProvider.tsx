// components/LanguageProvider.tsx
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { LangCode, messages, normalizeLang } from "../lib/i18n";

type LangContextValue = {
  lang: LangCode;
  t: (key: string) => string;
  setLang: (lang: LangCode) => void;
};

const LangContext = createContext<LangContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LangCode>("en");

  // inizializza partendo da:
  // 1) localStorage (se l'utente ha già aperto l'app)
  // 2) lingua di sistema (navigator.language)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = localStorage.getItem("quantivo-lang");
    let detected: LangCode;

    if (stored) {
      detected = normalizeLang(stored);
    } else {
      detected = normalizeLang(navigator.language || "en");
    }

    setLangState(detected);
    localStorage.setItem("quantivo-lang", detected);
    document.documentElement.lang = detected;
    document.cookie = `quantivo-lang=${detected}; path=/; max-age=31536000`;
  }, []);

  function setLang(next: LangCode) {
    setLangState(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("quantivo-lang", next);
      document.documentElement.lang = next;
      document.cookie = `quantivo-lang=${next}; path=/; max-age=31536000`;
    }
  }

  const value = useMemo<LangContextValue>(
    () => ({
      lang,
      t: (key: string) => {
        const dict = messages[lang] || messages.en;
        return dict[key] ?? messages.en[key] ?? key;
      },
      setLang,
    }),
    [lang]
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LangContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within <LanguageProvider>");
  }
  return ctx;
}
