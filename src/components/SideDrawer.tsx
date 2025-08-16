import React from 'react';
import { Link } from 'react-router-dom';
import type { UserProfile } from '@spotify/web-api-ts-sdk';

import { useTranslation } from '../i18n';

import SpotifyUserInfo from './SpotifyUserInfo';
import ThemeSwitcher from './ThemeSwitcher';
import { LanguageSelector } from './LanguageSelector';
import { LogoutButton } from './LogoutButton';
import GamePadIcon from './icons/GamePadIcon';
import QrCodeIcon from './icons/QrCodeIcon';

import './SideDrawer.css';

interface SideDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    user: UserProfile | null;
    logOut: () => void;
}

const SideDrawer: React.FC<SideDrawerProps> = ({ isOpen, onClose, user, logOut }) => {
    const { t } = useTranslation();
    return (
        <div className={`side-drawer ${isOpen ? 'open' : ''}`}>
            {/* <button className="close-btn" onClick={onClose}>
                ×
            </button> */}
            <div className="side-drawer-content">
                {user && (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <SpotifyUserInfo user={user} logOut={logOut}>
                            <LogoutButton onClick={logOut} style={{ margin: '4px' }}>
                                {t('logout')}
                            </LogoutButton>
                        </SpotifyUserInfo>
                    </div>
                )}
                <nav className="drawer-nav">
                    <ul>
                        <li>
                            <Link to="/game" onClick={onClose}>
                                <span className="icon-wrapper">
                                    <GamePadIcon />
                                </span>
                                {t('playGame')}
                            </Link>
                        </li>
                        <li>
                            <Link to="/generate" onClick={onClose}>
                                <span className="icon-wrapper">
                                    <QrCodeIcon />
                                </span>
                                {t('generateCodes')}
                            </Link>
                        </li>
                    </ul>
                </nav>
                <div className="drawer-bottom-section">
                    <LanguageSelector />
                    <ThemeSwitcher />
                </div>
            </div>
        </div>
    );
};

export default SideDrawer;
