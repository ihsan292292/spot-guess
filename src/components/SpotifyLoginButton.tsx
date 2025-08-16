import React from 'react';

import './SpotifyLoginButton.css';
import SpotifyLogo from './SpotifyLogo';

interface SpotifyLoginButtonProps {
    onClick?: () => void;
    disabled?: boolean;
    children: React.ReactNode;
}

const SpotifyLoginButton: React.FC<SpotifyLoginButtonProps> = ({ onClick, children, disabled }) => {
    return (
        <button className="spotify-login" onClick={onClick} disabled={disabled}>
            <SpotifyLogo className="spotify-logo" color="black" />
            {children}
        </button>
    );
};

export default SpotifyLoginButton;
