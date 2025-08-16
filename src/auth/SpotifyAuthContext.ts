import { createContext } from 'react';
import type { SpotifyApi, UserProfile } from '@spotify/web-api-ts-sdk';

export type SpotifyAuthContextType = {
    sdk: SpotifyApi | null;
    isAuthenticated: boolean;
    user: UserProfile | null;
    authenticate: () => Promise<void>;
    logOut: () => Promise<void>;
    error: Error | string | null;
    isCheckingAuthentication: boolean;
};

export const SpotifyAuthContext = createContext<SpotifyAuthContextType | undefined>(undefined);
