import React from 'react';

import { MainContentWrapper } from '../components/MainContentWrapper';
import { useSpotifyAuth } from '../auth';
// import { useTranslation } from '../i18n';


export const RootHome: React.FC = () => {
    // const {t} = useTranslation();
    
    const { user } = useSpotifyAuth();

    return (
        <>
            {user && (
                <MainContentWrapper>
                    <div>
                        <h2>Welcome to the Home Page!</h2>
                        <p>This content is only visible on the exact "/" route.</p>
                    </div>
                </MainContentWrapper>
            )}
        </>
    );
};
