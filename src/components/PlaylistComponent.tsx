import React, { useEffect, useState, useRef, useCallback } from 'react';
import type { Page, SpotifyApi, UserProfile } from '@spotify/web-api-ts-sdk';

import { useTranslation } from '../i18n';
import { SimplifiedPlaylistTracksRequired } from '../types/Spotify';

import QrCodePdfIcon from './icons/QrCodesDownloadIcon';
import LockIcon from './icons/LockIcon';
import Spinner from './Spinner';

import './PlaylistComponent.css';
import QuestionMarkIcon from './icons/QuestionMarkIcon';

type PlaylistComponentProps = {
    isGenerating: boolean;
    onGenerate: (playlists: Array<SimplifiedPlaylistTracksRequired>) => void;
    isAuthenticated: boolean;
    spotifySdk: SpotifyApi | null;
    user: UserProfile;
};

const PlaylistComponent: React.FC<PlaylistComponentProps> = ({
    isGenerating,
    onGenerate,
    isAuthenticated,
    spotifySdk,
    user,
}) => {
    const { t } = useTranslation();
    const [playlists, setPlaylists] = useState<Record<string, SimplifiedPlaylistTracksRequired>>({});
    const [loading, setLoading] = useState<boolean>(false);
    const [offset, setOffset] = useState<number>(0);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [selectedPlaylists, setSelectedPlaylists] = useState<string[]>([]);
    const [isSelectionMode, setSelectionMode] = useState<boolean>(false);
    const [errorFetching, setErrorFetching] = useState<Error | null>(null);

    const loader = useRef<HTMLDivElement | null>(null);
    const limit = 10; // Set a reasonable limit for each batch

    // Function to fetch user playlists, memoized to prevent re-creating on every render
    const loadPlaylists = useCallback(async () => {
        if (loading || !hasMore || !spotifySdk || !isAuthenticated || errorFetching) return; // Prevent fetching if already loading or no more items

        setLoading(true);
        // Test loading
        // await new Promise((res) => setTimeout(res, 3000));
        try {
            const token = await spotifySdk.getAccessToken(); // Ensure token is available

            // https://developer.spotify.com/documentation/web-api/reference/get-a-list-of-current-users-playlists
            const response = await fetch(`https://api.spotify.com/v1/me/playlists?limit=${limit}&offset=${offset}`, {
                headers: {
                    Authorization: `Bearer ${token?.access_token}`,
                },
            });

            const data: Page<SimplifiedPlaylistTracksRequired> = await response.json();

            //Spotify broke the API (https://developer.spotify.com/blog/2024-11-27-changes-to-the-web-api)
            // 8. Algorithmic and Spotify-owned editorial playlists
            // fetching playlists can now result in items being null inside the returned array...
            const filteredItems = data.items.filter(playlist => playlist !== null && ("id" in playlist));
            
            // Update playlists state and pagination
            const newItems = Object.fromEntries(filteredItems.map((item) => [item.id, item]));
            setPlaylists((prev) => ({ ...prev, ...newItems }));
            setHasMore(data.next !== null); // If next is null, there's no more data
            setOffset((prev) => prev + data.items.length); // Update offset for pagination
        } catch (e) {
            const error = e as Error;
            console.error('Error fetching playlists:', error);
            setErrorFetching(error);
        } finally {
            setLoading(false); // Ensure loading is reset even on failure
        }
    }, [loading, hasMore, spotifySdk, offset, isAuthenticated, errorFetching]); // Depend on relevant states including offset

    // TODO: Bug with StrictMode in React18!
    // Initial loading of playlists when sdk is ready
    useEffect(() => {
        if (isAuthenticated && spotifySdk && offset === 0) {
            loadPlaylists();
        }
    }, [spotifySdk, loadPlaylists, offset, isAuthenticated]);

    // Infinite scroll observer
    const handleObserver = useCallback(
        (entries: IntersectionObserverEntry[]) => {
            const target = entries[0];
            if (target.isIntersecting && hasMore && !loading && isAuthenticated) {
                loadPlaylists();
            }
        },
        [hasMore, loading, loadPlaylists, isAuthenticated]
    );

    useEffect(() => {
        const options = {
            root: null,
            rootMargin: '20px',
            threshold: 0.5, // Trigger when 50% of the loader is visible
        };

        const observer = new IntersectionObserver(handleObserver, options);
        if (loader.current) {
            observer.observe(loader.current);
        }

        return () => {
            if (loader.current) {
                observer.unobserve(loader.current);
            }
        };
    }, [loader, handleObserver]);

    const toggleSelectPlaylist = (id: string) => {
        setSelectedPlaylists((prev) => (prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]));
    };

    // Reset selected playlists when canceling selection mode
    const toggleSelectionMode = () => {
        if (isSelectionMode) {
            // Reset selected playlists when exiting selection mode
            setSelectedPlaylists([]);
        }
        setSelectionMode(!isSelectionMode);
    };

    // Reset selected playlists manually (reset button)
    const resetSelection = () => {
        setSelectedPlaylists([]);
    };

    // Generate QR Code function (placeholder)
    const generateQrCode = (playlistId: string) => {
        // alert(`Generate QR code for playlist: ${playlistId}`);
        onGenerate([playlists[playlistId]]);
    };

    // Generate QR Code for multiple playlists
    const generateQrCodesForSelected = () => {
        // alert(`Generating QR codes for selected playlists: ${selectedPlaylists.join(', ')}`);
        onGenerate(selectedPlaylists.map((id) => playlists[id]));
    };

    return (
        <div className="playlist-container">
            <p className="playlist-title">
                {user.display_name}
                {t('yourPlaylists')}
            </p>
            <button className="select-button" onClick={toggleSelectionMode} disabled={isGenerating}>
                {isSelectionMode ? t("cancelSelection") : t("selectPlaylists")}
            </button>

            <ul className="playlist-list">
                {Object.entries(playlists).map(([id, playlist]) => (
                    <li
                        key={id}
                        className={`playlist-item ${selectedPlaylists.includes(id) ? 'selected' : ''} ${isSelectionMode ? 'hover-enabled' : ''}`}
                        onClick={() => isSelectionMode && toggleSelectPlaylist(id)}
                    >
                        {isSelectionMode && (
                            <div className="checkbox">{selectedPlaylists.includes(id) ? '☑' : '☐'}</div>
                        )}
                        {
                            playlist && playlist.images && playlist.images.length > 0 ? <img src={playlist.images[0].url } alt={playlist.name} className="playlist-image" /> : <QuestionMarkIcon className="playlist-image" style={{padding: "12px"}}/>
                        }
                        
                        <div className="playlist-info">
                            <h3 className="playlist-name">
                                {!playlist.public && (
                                    <span className="lock-icon">
                                        <LockIcon></LockIcon>
                                    </span>
                                )}
                                {playlist.name}
                            </h3>
                            <p className="playlist-tracks">{playlist.tracks.total} {t("tracks")}</p>
                        </div>
                        {!isSelectionMode && (
                            <QrCodePdfIcon
                                className="qr-icon"
                                text={t("generate")}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    generateQrCode(id);
                                }}
                                // disabled={isGenerating}
                            />
                        )}
                    </li>
                ))}
            </ul>

            {isSelectionMode && selectedPlaylists.length > 0 && (
                <div className="floating-actions">
                    <button className="reset-button" onClick={resetSelection} disabled={isGenerating}>
                        {t("resetSelection")}
                    </button>
                    <button
                        className="generate-all-button"
                        onClick={generateQrCodesForSelected}
                        disabled={isGenerating}
                    >
                        {t("generateQrCodesFor")} {selectedPlaylists.length} {t("playlists")}
                    </button>
                </div>
            )}

            {loading && (
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <Spinner size="50px" speed="1.0s" />
                </div>
            )}

            <div ref={loader} style={{ height: '20px' }} />
        </div>
    );
};

export default PlaylistComponent;
