import React, { useState } from 'react';
import type { Page, PlaylistedTrack } from '@spotify/web-api-ts-sdk';

import PlaylistComponent from '../components/PlaylistComponent';
import LoadingOverlay from '../components/LoadingOverlayView';
// import { generatePdf } from '../services/playlist-pdf-generator';
import { MainContentWrapper } from '../components/MainContentWrapper';
import { useSpotifyAuth } from '../auth';
import { useTranslation } from '../i18n';
import { PlaylistWithTracks, SimplifiedPlaylistTracksRequired } from '../types/Spotify';
import { usePdfGenerationWorker } from '../worker/pdf-generation-worker/hooks';

const GenerateCodes: React.FC = () => {
    const {t} = useTranslation();
    
    const { sdk: spotifySdk, user, isAuthenticated } = useSpotifyAuth();

    const [isGenerating, setIsGenerating] = useState(false);
    const [, setGenerationError] = useState<string | null>(null); //TODO: Use the generation error
    const [progress, setProgress] = useState<number>(0);
    const [progressSection, setProgressSection] = useState<string | null>(null);
    const {generatePdf} = usePdfGenerationWorker();

    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    const handleOnGenerate = async (playlists: Array<SimplifiedPlaylistTracksRequired>) => {
        setIsGenerating(true);
        setGenerationError(null);
        setProgress(0);
        setProgressSection('Fetching Song Information...');

        const totalTracks = (playlists ?? []).reduce((acc, cur) => acc + cur.tracks.total, 0);
        const playlistsWithTracks: Array<PlaylistWithTracks> = [];
        let totalFetched = 0;

        try {
            for (const list of playlists) {
                const playlist_id: string = list.id;
                const market = undefined;
                // https://developer.spotify.com/documentation/web-api/reference/get-playlists-tracks
                const fields =
                    'limit,next,offset,total,items(track(id,uri,name,duration_ms,explicit,artists,type,popularity,album(id,name,album_type,total_tracks,release_date,release_date_precision),show(id)))';
                const limit = 50;
                let offset = 0;

                let allItems: PlaylistedTrack[] = [];

                // eslint-disable-next-line no-constant-condition
                while (true) {
                    const res: Page<PlaylistedTrack> | undefined = await spotifySdk?.playlists.getPlaylistItems(
                        playlist_id,
                        market,
                        fields,
                        limit,
                        offset
                    );

                    if (!res) {
                        throw new Error(`Failed to fetch items for playlist: ${playlist_id}`);
                    }

                    if (res.items) {
                        allItems = allItems.concat(res.items);
                        totalFetched += res.items.length;
                        setProgress((totalFetched / totalTracks) * 100);
                    }

                    if (!res.next) {
                        break;
                    }

                    offset += limit;
                    await delay(50);
                }
                const res: PlaylistWithTracks = { ...list, trackInfos: allItems };
                playlistsWithTracks.push(res);
            }
        } catch (error) {
            console.error(error);
            if (error instanceof Error) {
                setGenerationError(error.message);
            } else {
                setGenerationError('An unknown error occurred.');
            }
            setProgress(0);
        }

        const pdfBlob = await generatePdf({payload: {playlists: playlistsWithTracks}, onProgress: async ({section, progress}) => {
            setProgressSection((prevSection) => (prevSection !== section ? section : prevSection));
            setProgress(progress);
        }});

        const pdfUrl = URL.createObjectURL(pdfBlob);
        const popup = window.open(pdfUrl);
        if (!popup) {
            // If the popup is blocked, fallback to download
            console.warn("Popup blocked, initiating download fallback.");
            const documentName = `${new Date().toISOString().slice(0, 19).replace('T', '_').replace(/:/g, '_').replace(/-/g, '_')}}_${import.meta.env.VITE_APP_NAME.replace(" ", "_")}.pdf`;
            const anchor = document.createElement("a");
            anchor.href = pdfUrl;
            anchor.download = documentName;
            anchor.click();
        }
        setIsGenerating(false);
    };

    return (
        <div>
            {isGenerating && (
                <LoadingOverlay
                    header={<p>{progressSection}</p>}
                    footer={<p>{Math.ceil(progress)}%</p>}
                    progress={progress}
                />
            )}
            {user ? (
                <PlaylistComponent
                    onGenerate={handleOnGenerate}
                    isGenerating={isGenerating}
                    isAuthenticated={isAuthenticated}
                    spotifySdk={spotifySdk}
                    user={user}
                />
            ) : (
                <MainContentWrapper>
                    <h1>{t("generateCodesViewAuthMissingErrorMsg")}</h1>
                </MainContentWrapper>
            )}
        </div>
    );
};

export default GenerateCodes;
