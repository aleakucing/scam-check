import idLocale from "../locales/id.json";

export type Locale = "id";
let currentLocale: Locale = "id";

const locales: Record<string, any> = {
  id: idLocale
};

/**
 * Access nested translation string by dot notation, e.g. t('operator.title')
 */
export function t(key: string, fallback: string = ""): any {
  const dict = locales[currentLocale] || idLocale;
  const parts = key.split(".");
  let val: any = dict;

  for (const part of parts) {
    if (val && typeof val === "object" && part in val) {
      val = val[part];
    } else {
      return fallback || key;
    }
  }

  return val;
}

export function getLocale(): Locale {
  return currentLocale;
}

export function setLocale(locale: Locale) {
  if (locales[locale]) {
    currentLocale = locale;
  }
}
