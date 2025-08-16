import { SpotifyWebPlayerState, SpotifyWebPlayerAction } from './SpotifyWebPlayerContextType';

export const spotifyWebPlayerReducer = (
    state: SpotifyWebPlayerState,
    action: SpotifyWebPlayerAction
): SpotifyWebPlayerState => {
    switch (action.type) {
        case 'SET_STATE_CHANGED':
            return {
                ...state,
                currentTrack: action.payload.state.track_window.current_track,
                isPaused: action.payload.state.paused,
                playbackState: action.payload.state
            }
        case 'SET_PLAYER':
            return { ...state, deviceId: action.payload.deviceId, player: action.payload.player };
        case 'SET_ACTIVE':
            return { ...state, isActive: action.payload };
        case 'SET_PAUSED':
            return { ...state, isPaused: action.payload };
        case 'SET_CURRENT_TRACK':
            return { ...state, currentTrack: action.payload };
        default:
            return state;
    }
};
