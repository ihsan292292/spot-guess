import React from 'react';

import { useTranslation, SupportedLanguage, translations } from '../i18n/';
import './LanguageSelector.css';

export const LanguageSelector: React.FC = () => {
    const { language, setLanguage, t } = useTranslation();

    return (
        <div className="language-selector-container">
            <label htmlFor="language-select" className="language-label">
                {t('language')}
            </label>
            <select
                id="language-select"
                value={language}
                onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
                className="language-select"
            >
                {Object.entries(translations).map(([langKey, trans]) => (
                    <option key={langKey} value={langKey}>
                        {trans["thisLang"]}
                    </option>
                ))}
            </select>
        </div>
    );
};