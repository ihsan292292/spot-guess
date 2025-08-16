import type { UserProfile, Image } from '@spotify/web-api-ts-sdk';
import React from 'react';

import './SpotifyUserInfo.css'
import { useTranslation } from '../i18n';

const ProfilePicture: React.FC<{ imageUrl: string }> = ({ imageUrl }) => {
    const containerStyle: React.CSSProperties = {
        display: 'inline-block',
        overflow: 'hidden',
        borderRadius: '50%',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
        transition: 'transform 0.3s ease',
    };

    const imageStyle: React.CSSProperties = {
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        objectFit: 'cover',
        transition: 'transform 0.3s ease',
    };

    const [isHovered, setIsHovered] = React.useState(false);

    return (
        <div
            style={{
                ...containerStyle,
                transform: isHovered ? 'translateY(-5px)' : 'translateY(0)',
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <img
                src={imageUrl}
                alt="Profile"
                style={{
                    ...imageStyle,
                    transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                }}
            />
        </div>
    );
};

const SpotifyUserInfo: React.FC<{ user: UserProfile, logOut: () => void; children: React.ReactNode; }> = ({ user, children }) => {
    const {t} = useTranslation()
    const img: Image | null = React.useMemo(() => {
        let img: Image | null = null;
        let maxSize = 0;
        if (user.images != null && Array.isArray(user.images)) {
            for (const curr of user.images) {
                const size = curr.width * curr.height;
                if (size > maxSize) {
                    img = curr;
                    maxSize = size;
                }
            }
        }
        return img;
    }, [user]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginTop: "0.5em" }}>
            <div className="profile-container">{img != null && <ProfilePicture imageUrl={img.url} />}</div>
            <p
                style={{
                    marginBlockStart: '0.5em',
                    marginBlockEnd: '0.5em',
                    marginInlineStart: '0px',
                    marginInlineEnd: '0px',
                }}
            >
                {t("welcome")} {user.display_name}
            </p>
            {children}
        </div>
    );
};

export default SpotifyUserInfo;
