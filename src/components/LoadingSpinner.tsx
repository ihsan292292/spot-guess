import React from 'react';

import './LoadingSpinner.css';
import { useTranslation } from '../i18n';

const LoadingSpinner: React.FC = () => {
    const {t} = useTranslation();

    return (
    <div className="loading-spinner">
        <div className="spinner"></div>
        <p>{t("lazyLoadingComponentText")}</p>
    </div>
    );
};

export default LoadingSpinner;