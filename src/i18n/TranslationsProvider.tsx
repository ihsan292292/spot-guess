import React, { useState, ReactNode } from 'react';

import { translations, SupportedLanguage, TranslationKeys } from './translations';
import { TranslationContext } from './TranslationContext';

export const TranslationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const selectedLanguageLocalStorageKey = 'language';
    const browserLanguage = navigator.language.slice(0, 2) as SupportedLanguage;
    const defaultLanguage = (browserLanguage in translations ? browserLanguage : 'en') as SupportedLanguage;

    const [language, setLanguageState] = useState<SupportedLanguage>(() => {
        return (localStorage.getItem(selectedLanguageLocalStorageKey) as SupportedLanguage) || defaultLanguage;
    });

    const setLanguage = (lang: SupportedLanguage) => {
        setLanguageState(lang);
        localStorage.setItem(selectedLanguageLocalStorageKey, lang);
    };

    const t = (key: TranslationKeys) => {
        return translations[language][key] || key; // Fallback to key if translation is missing, should never happen, maybe even just return the english value
    };

    return <TranslationContext.Provider value={{ language, setLanguage, t }}>{children}</TranslationContext.Provider>;
};
