'use client';

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
    // Update HTML lang attribute
    document.documentElement.lang = lang;
    // Update text direction for Tamil
    document.documentElement.dir = lang === 'ta' ? 'ltr' : 'ltr';
  };

  if (!mounted) return null;

  return (
    <div className="flex gap-2 items-center">
      <span className="text-sm font-medium">{t('common.language')}:</span>
      <button
        onClick={() => handleLanguageChange('en')}
        className={`px-3 py-1 rounded text-sm transition-colors ${
          i18n.language === 'en'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
        }`}
      >
        {t('common.english')}
      </button>
      <button
        onClick={() => handleLanguageChange('ta')}
        className={`px-3 py-1 rounded text-sm transition-colors ${
          i18n.language === 'ta'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
        }`}
      >
        {t('common.tamil')}
      </button>
    </div>
  );
}
