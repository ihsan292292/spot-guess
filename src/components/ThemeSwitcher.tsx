import { useState, useEffect } from 'react';

import './ThemeSwitcher.css';
import { useTranslation } from '../i18n';

const ThemeSwitcher = () => {
    const {t} = useTranslation();
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const userPreference = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const savedTheme = localStorage.getItem('theme');

        if (savedTheme) {
            setIsDarkMode(savedTheme === 'dark');
            document.documentElement.setAttribute('data-theme', savedTheme);
        } else {
            setIsDarkMode(userPreference);
            document.documentElement.setAttribute('data-theme', userPreference ? 'dark' : 'light');
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = isDarkMode ? 'light' : 'dark';
        setIsDarkMode(!isDarkMode);
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'row', placeItems: 'center', justifyContent: "end" }}>
            <p>{isDarkMode ? t('dark') : t("light")}</p>
            <div className="switch">
                <input
                    className="switch__input"
                    type="checkbox"
                    checked={!isDarkMode}
                    id="theme-toggle"
                    onChange={toggleTheme}
                    aria-label="Toggle between Light and Dark Mode"
                />
                <label className="switch__label" htmlFor="theme-toggle">
                    <span className="switch__indicator"></span>
                    <span className="switch__decoration"></span>
                </label>
            </div>
        </div>
    );
};

export default ThemeSwitcher;
