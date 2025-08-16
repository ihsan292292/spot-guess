import React, { createContext, useReducer, useContext, ReactNode } from 'react';

import { SpotifyWebPlayerState, SpotifyWebPlayerAction } from './SpotifyWebPlayerContextType';
import { spotifyWebPlayerReducer } from './SpotifyWebPlayerContextReducer';

const defaultState: SpotifyWebPlayerState = {
    deviceId: null,
    player: null,
    isActive: null,
    isPaused: true,
    currentTrack: null,
    playbackState: null,
};

const SpotifyWebPlayerContext = createContext<SpotifyWebPlayerState>(defaultState);
const SpotifyWebPlayerDispatchContext = createContext<React.Dispatch<SpotifyWebPlayerAction> | undefined>(undefined);

export const SpotifyPlayerContextProvider: React.FC<{
    children: ReactNode;
}> = ({ children }) => {
    const [state, dispatch] = useReducer(spotifyWebPlayerReducer, defaultState);

    return (
        <SpotifyWebPlayerContext.Provider value={state}>
            <SpotifyWebPlayerDispatchContext.Provider value={dispatch}>
                {children}
            </SpotifyWebPlayerDispatchContext.Provider>
        </SpotifyWebPlayerContext.Provider>
    );
};

export const useSpotifyWebPlayerContext = () => useContext(SpotifyWebPlayerContext);
export const useSpotifyWebPlayerContextDispatch = () => {
    const context = React.useContext(SpotifyWebPlayerDispatchContext);
    if (context === undefined) {
        throw new Error('useSpotifyPlayerContextDispatch must be used within a SpotifyPlayerProvider');
    }
    return context;
};
