import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const { i18n } = useTranslation();
  const [currentLang, setCurrentLang] = useState(i18n.language || 'en');
  const [dir, setDir] = useState('ltr');

  useEffect(() => {
    const handleLanguageChange = (lng) => {
      const language = lng.split('-')[0]; // Handle language codes like 'en-US'
      setCurrentLang(language);
      const direction = language === 'ur' ? 'rtl' : 'ltr';
      setDir(direction);
      
      document.documentElement.dir = direction;
      document.documentElement.lang = language;
    };

    // Initialize direction for default language
    handleLanguageChange(i18n.language || 'en');

    i18n.on('languageChanged', handleLanguageChange);

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  const changeLanguage = async (lng) => {
    await i18n.changeLanguage(lng);
    localStorage.setItem('i18nextLng', lng);
  };

  const languages = [
    { code: 'en', name: 'English', nativeName: 'English', dir: 'ltr' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', dir: 'ltr' },
    { code: 'mr', name: 'Marathi', nativeName: 'मराठी', dir: 'ltr' },
    { code: 'ur', name: 'Urdu', nativeName: 'اردو', dir: 'rtl' },
  ];

  return (
    <LanguageContext.Provider value={{ currentLang, changeLanguage, dir, languages }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
