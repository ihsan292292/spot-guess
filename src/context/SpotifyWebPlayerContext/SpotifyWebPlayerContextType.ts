// import type { Track } from '@spotify/web-api-ts-sdk';

export type SpotifyWebPlayerAction =
    | { type: 'SET_STATE_CHANGED'; payload: { state: Spotify.PlaybackState } }
    | { type: 'SET_PLAYER'; payload: { deviceId: string; player: Spotify.Player } }
    | { type: 'SET_ACTIVE'; payload: boolean }
    | { type: 'SET_PAUSED'; payload: boolean }
    | { type: 'SET_CURRENT_TRACK'; payload: Spotify.Track | null };

export interface SpotifyWebPlayerState {
    deviceId: string | null;
    player: Spotify.Player | null;
    isActive: boolean | null;
    isPaused: boolean;
    currentTrack: Spotify.Track | null;
    playbackState: Spotify.PlaybackState | null;
}
