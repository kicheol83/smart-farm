import type { Locale } from "date-fns";
import { enUS, ko, uz } from "date-fns/locale";
import { en as enMessages } from "./messages/en";
import { ko as koMessages } from "./messages/ko";
import { uz as uzMessages } from "./messages/uz";

export type Lang = "ko" | "en" | "uz";

export const LANGS: Lang[] = ["ko", "en", "uz"];
export const DEFAULT_LANG: Lang = "ko";
export const STORAGE_KEY = "smartfarm.lang";

const DICTIONARIES: Record<Lang, Record<string, string>> = {
  ko: koMessages,
  en: enMessages,
  uz: uzMessages,
};

const LOCALES: Record<Lang, string> = { ko: "ko-KR", en: "en-US", uz: "uz-UZ" };
const DATE_LOCALES: Record<Lang, Locale> = { ko, en: enUS, uz };

export function isLang(value: unknown): value is Lang {
  return typeof value === "string" && (LANGS as string[]).includes(value);
}

function initialLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return isLang(saved) ? saved : DEFAULT_LANG;
  } catch {
    return DEFAULT_LANG;
  }
}

let current: Lang = initialLang();

export function getLang(): Lang {
  return current;
}

export function setCurrentLang(lang: Lang): void {
  current = lang;
}

export function locale(): string {
  return LOCALES[current];
}

export function dateLocale(): Locale {
  return DATE_LOCALES[current];
}

export function t(key: string, vars?: Record<string, string | number>): string {
  const template = DICTIONARIES[current][key] ?? DICTIONARIES.en[key] ?? key;
  if (vars === undefined) {
    return template;
  }
  return template.replace(/\{(\w+)\}/g, (match, name: string) => (name in vars ? String(vars[name]) : match));
}
