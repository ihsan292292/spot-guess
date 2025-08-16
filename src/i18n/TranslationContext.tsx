import { createContext } from 'react';

import { TranslationKeys, SupportedLanguage } from './translations';

export interface TranslationContextProps {
    language: SupportedLanguage;
    setLanguage: (lang: SupportedLanguage) => void;
    t: (key: TranslationKeys) => string;
}

export const TranslationContext = createContext<TranslationContextProps | undefined>(undefined);
