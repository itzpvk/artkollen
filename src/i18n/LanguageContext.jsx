import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { strings } from './strings.jsx';

const STORAGE_KEY = 'artkollen-lang';
const LanguageContext = createContext(null);

function initialLanguage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'sv' || saved === 'en') return saved;
  } catch {
    // Storage can be blocked; fall back to Swedish.
  }
  return 'sv';
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(initialLanguage);

  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Not critical.
    }
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, t: strings[lang] }), [lang]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}

export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title;
  }, [title]);
}
