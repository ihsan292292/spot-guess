import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    SpotifyApi,
    Scopes,
    SdkOptions,
    AuthorizationCodeWithPKCEStrategy,
    UserProfile,
} from '@spotify/web-api-ts-sdk';
import { SpotifyAuthContext } from './SpotifyAuthContext';
import { useTranslation } from '../i18n';

const DEFAULT_SCOPES = [...Scopes.userDetails, ...Scopes.userPlayback, ...Scopes.playlistRead];
const DEFAULT_CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID!;
const DEFAULT_REDIRECT_TARGET = import.meta.env.VITE_REDIRECT_TARGET!;

export const SpotifyAuthProvider: React.FC<{
    children: React.ReactNode;
    spotifyConfig?: {
        clientId?: string;
        redirectUrl?: string;
        scopes?: string[];
        config?: SdkOptions;
    };
}> = ({ children, spotifyConfig }) => {
    const {
        clientId = DEFAULT_CLIENT_ID,
        redirectUrl = DEFAULT_REDIRECT_TARGET,
        scopes = DEFAULT_SCOPES,
        config,
    } = spotifyConfig ?? {};

    const [sdk, setSdk] = useState<SpotifyApi | null>(null);
    const [error, setError] = useState<Error | string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [user, setUser] = useState<UserProfile | null>(null);
    const { current: activeScopes } = useRef(scopes);
    const [isCheckingAuthentication, setIsCheckingAuthentication] = useState<boolean>(true);
    const {t} = useTranslation();

    const authenticateManual = async (sdk: SpotifyApi) => {
        try {
            const { authenticated } = await sdk.authenticate();
            if (authenticated) {
                setSdk(sdk);
                try {
                    const user = await sdk.currentUser.profile();
                    if(user){
                        setUser(user);
                        setIsAuthenticated(true);
                    }
                } catch(error){
                    if (error instanceof Error) {
                        if (error.message.includes('Check settings on developer.spotify.com/dashboard, the user may not be registered.')) {
                            setError(t('userNotAddedToTheSpotifyAppError'));
                        } else {
                          console.error('An unexpected error occurred:', error.message);
                        }
                    }
                }
            }
        } catch (e: Error | unknown) {
            const error = e as Error;
            if (error?.message?.includes('No verifier found in cache')) {
                console.error(
                    'If you are seeing this error in a React Development Environment, it’s because React calls useEffect twice. This will not impact your production applications or anything running outside of Strict Mode.',
                    error
                );
            } else {
                console.error('Authentication failed:', e);
                setError(error);
            }
        }
    };

    // Initialize SDK and attempt authentication on load
    useEffect(() => {
        const initializeSdk = async () => {
            setIsCheckingAuthentication(true);
            const auth = new AuthorizationCodeWithPKCEStrategy(clientId, redirectUrl, activeScopes);
            const internalSdk = new SpotifyApi(auth, config);
            setSdk(internalSdk);

            if (internalSdk) {
                const token = await internalSdk.getAccessToken();
                const args = new URLSearchParams(window.location.search);
                const code = args.get('code');

                // Check if a token is present or we have a code for token exchange
                if (token != null || code) {
                    await authenticateManual(internalSdk);
                }
            }
            setIsCheckingAuthentication(false);
        };

        initializeSdk();
    }, [clientId, redirectUrl, config, activeScopes]);

    const authenticate = useCallback(async () => {
        if (sdk) {
            await authenticateManual(sdk);
        }
    }, [sdk]);

    const logOut = useCallback(async () => {
        if (sdk) {
            await sdk.logOut();
            setIsAuthenticated(false);
            setUser(null);
        } else {
            console.log('Attempted to log out without initializing the SDK.');
        }
    }, [sdk]);

    return (
        <SpotifyAuthContext.Provider value={{ sdk, isAuthenticated, authenticate, logOut, error, user, isCheckingAuthentication }}>
            {children}
        </SpotifyAuthContext.Provider>
    );
};
