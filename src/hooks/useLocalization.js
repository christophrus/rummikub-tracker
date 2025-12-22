import { useState } from 'react';

export const useLocalization = () => {
  const [uiLanguage, setUiLanguage] = useState(() => {
    const savedUiLanguage = localStorage.getItem('ui-language');
    return savedUiLanguage || 'en';
  });

  const changeUiLanguage = (lang) => {
    setUiLanguage(lang);
    localStorage.setItem('ui-language', lang);
  };

  return {
    uiLanguage,
    changeUiLanguage
  };
};
