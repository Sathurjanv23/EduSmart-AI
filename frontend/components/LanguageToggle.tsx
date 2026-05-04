'use client';

import * as React from 'react';
import { useTranslation } from 'react-i18next';

export function LanguageToggle() {
  const { i18n } = useTranslation();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const currentLang = i18n.language || 'en';

  const toggleLanguage = () => {
    const nextLang = currentLang === 'en' ? 'ta' : 'en';
    i18n.changeLanguage(nextLang);
    localStorage.setItem('language', nextLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="inline-flex h-9 items-center justify-center rounded-full bg-white dark:bg-slate-800 px-3 text-sm font-semibold text-slate-700 dark:text-slate-300 ring-1 ring-inset ring-slate-200 dark:ring-slate-700 transition-all hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      aria-label="Toggle language"
    >
      {currentLang === 'en' ? 'தமிழ்' : 'English'}
    </button>
  );
}
