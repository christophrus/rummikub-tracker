import { useState, useEffect } from 'react';

export const useLocalization = () => {
  const [uiLanguage, setUiLanguage] = useState('en');
  
  useEffect(() => {
    const savedUiLanguage = localStorage.getItem('ui-language');
    if (savedUiLanguage) setUiLanguage(savedUiLanguage);
  }, []);

  const changeUiLanguage = (lang) => {
    setUiLanguage(lang);
    localStorage.setItem('ui-language', lang);
  };

  return {
    uiLanguage,
    changeUiLanguage
  };
};
