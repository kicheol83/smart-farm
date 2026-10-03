import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getLang, setCurrentLang, STORAGE_KEY, t, type Lang } from "./core";

type I18nContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: typeof t;
};

const I18nContext = createContext<I18nContextValue>({ lang: getLang(), setLang: () => undefined, t });

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(getLang());

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setCurrentLang(next);
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      return;
    }
  }, []);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  return useContext(I18nContext);
}
