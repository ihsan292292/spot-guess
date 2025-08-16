
import React, { useEffect } from 'react';

import { useSpotifyWebPlayerContext, useSpotifyWebPlayerContextDispatch } from '../context/SpotifyWebPlayerContext';
import { useTranslation } from '../i18n';

const useUpdateIframeTitle = (iframeSrc: string, newTitle: string) => {
    useEffect(() => {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    const iframe = Array.from(document.querySelectorAll('iframe'))
                        .find((el) => el.src === iframeSrc);
                    
                    if (iframe) {
                        iframe.title = newTitle;    
                        console.log(`Iframe title updated to: ${newTitle}`);
                        observer.disconnect();
                    }
                }
            });
        });

        observer.observe(document.body, { childList: true, subtree: false });

        return () => observer.disconnect();
    }, [iframeSrc, newTitle]);
};

interface WebPlaybackProps {
    token: string;
    onPlayerReady: (deviceId: string) => void;
    hidePlayer: boolean;
}

const WebPlayback: React.FC<WebPlaybackProps> = ({ token, onPlayerReady, hidePlayer }) => {
    const { t } = useTranslation();
    const spotifyPlayerState = useSpotifyWebPlayerContext();
    const dispatch = useSpotifyWebPlayerContextDispatch();
    useUpdateIframeTitle('https://sdk.scdn.co/embedded/index.html', import.meta.env.VITE_APP_NAME);

    useEffect(() => {
        const spotifyPlayerScriptId = 'spotify-player-script';
        if (!document.getElementById(spotifyPlayerScriptId)) {
            const script = document.createElement('script');
            script.id = spotifyPlayerScriptId;
            script.src = 'https://sdk.scdn.co/spotify-player.js';
            script.async = true;
            document.body.appendChild(script);
        }
    
        let player: Spotify.Player | null = null;
    
        const initializePlayer = () => {
            if (player || !window.Spotify) return;
    
            player = new window.Spotify.Player({
                name: import.meta.env.VITE_APP_NAME,
                getOAuthToken: (cb: (token: string) => void) => {
                    cb(token);
                },
                volume: 1.0,
            });
    
            player.addListener('ready', async ({ device_id }) => {
                console.log('Ready with Device ID', device_id);
                dispatch({
                    type: 'SET_PLAYER',
                    payload: {
                        deviceId: device_id,
                        player: player!, //TODO CHECK!?
                    },
                });
              
                onPlayerReady(device_id);
            });
    
            player.addListener('not_ready', ({ device_id }) => {
                console.log('Device ID has gone offline', device_id);
            });
    
            player.addListener('player_state_changed', (state) => {
                console.log('Player state changed', state);
                if (state) {
                    dispatch({
                        type: 'SET_STATE_CHANGED',
                        payload: { state },
                    });
                    player?.getCurrentState().then((currentState) => {
                        dispatch({
                            type: 'SET_ACTIVE',
                            payload: !!currentState,
                        });
                    });
                }
            });
    
            player.on('initialization_error', ({ message }) => {
                console.error('Failed to initialize', message);
            });
    
            player.on('authentication_error', ({ message }) => {
                console.error('Failed to authenticate', message);
            });
    
            player.on('account_error', ({ message }) => {
                console.error('Failed to validate Spotify account', message);
            });
    
            player.on('playback_error', ({ message }) => {
                console.error('Failed to perform playback', message);
            });
    
            player.connect().then((success) => {
                if (success) {
                    console.log('The Web Playback SDK successfully connected to Spotify!');
                } else {
                    console.log('The Web Playback SDK couldn’t connect to Spotify!');
                }
            });
        };
    
        if (window.Spotify) {
            initializePlayer();
        } else {
            window.onSpotifyWebPlaybackSDKReady = initializePlayer;
        }
    
        return () => {
            if (player) {
                player.disconnect();
                player = null;
            }
        };
    }, [token]);

    if (spotifyPlayerState.isActive === false) {
        return (
            <div className="container">
                <div className="main-wrapper">
                    <b>{t('webPlayerNotActiveErrorMsg')}</b>
                </div>
            </div>
        );
    } else {
        return (
            <div className="container">
                <div className="main-wrapper" hidden={hidePlayer}>
                    <img
                        src={spotifyPlayerState?.currentTrack?.album?.images[0]?.url}
                        className="now-playing__cover"
                        alt=""
                    />

                    <div className="now-playing__side">
                        <div className="now-playing__name">{spotifyPlayerState?.currentTrack?.name}</div>
                        <div className="now-playing__artist">{spotifyPlayerState?.currentTrack?.artists[0].name}</div>

                        <button className="btn-spotify" onClick={() => spotifyPlayerState?.player?.previousTrack()}>
                            &lt;&lt;
                        </button>

                        <button className="btn-spotify" onClick={() => spotifyPlayerState?.player?.togglePlay()}>
                            {spotifyPlayerState.isPaused ? 'PLAY' : 'PAUSE'}
                        </button>

                        <button className="btn-spotify" onClick={() => spotifyPlayerState?.player?.nextTrack()}>
                            &gt;&gt;
                        </button>
                    </div>
                </div>
            </div>
        );
    }
};

export default WebPlayback;

