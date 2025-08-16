// MIGRATION GUIDE JEST -> VITEST: https://vitest.dev/guide/migration
import { describe, it, vi } from 'vitest'
import fs from 'fs';
import path from 'path';

import type { ExternalUrls, Image } from '@spotify/web-api-ts-sdk';

import { PlaylistWithTracks, ReducedEpisode, ReducedPlaylistedTrack, ReducedTrack } from '../types/Spotify';

import { generatePdf } from './playlist-pdf-generator';

vi.setConfig({ testTimeout: 180_000 })

function generateInt(options: {from: number, to: number}): number {
   return Math.floor(Math.random() * (options.to - options.from + 1)) + options.from;
}
function getRandomReleaseDate(options: MockDataOptions): string {
    const year = Math.floor(Math.random() * (options.yearRange.to - options.yearRange.from + 1)) + options.yearRange.from;
    const month = Math.floor(Math.random() * 12) + 1;
    const daysInMonth = new Date(year, month, 0).getDate();
    const day = Math.floor(Math.random() * daysInMonth) + 1;
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function generateId(length: number = 10): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters.charAt(randomIndex);
    }
    return result;
}

function generateTestExternalUrls(): ExternalUrls {
    return { spotify: 'https://open.spotify.com' };
}

function generateTestImage(): Image {
    return {
        height: 100,
        url: 'https://picsum.photos/100',
        width: 100,
    };
}

function generateTestOwner(): PlaylistWithTracks['owner'] {
    const user_id = generateId();
    return {
        display_name: 'User Name',
        external_urls: generateTestExternalUrls(),
        href: `https://api.spotify.com/v1/users/${user_id}`,
        id: user_id,
        type: 'user',
        uri: `spotify:user:${user_id}`,
    };
}

function generateTestAlbum(options: MockDataOptions): ReducedTrack['album'] {
    return {
        name: 'Album Name',
        release_date: getRandomReleaseDate(options),
        total_tracks: 10,
        album_type: 'album',
        release_date_precision: 'day',
        id: generateId(),
    };
}

function generateTestArtist(): ReducedTrack['artists'][number] {
    const artist_id = generateId();
    return {
        external_urls: generateTestExternalUrls(),
        href: `https://api.spotify.com/v1/artists/${artist_id}`,
        id: artist_id,
        name: 'Artist Name',
        type: 'artist',
        uri: `spotify:artist:${artist_id}`,
    };
}

function generateTestEpisode(): ReducedEpisode {
    return {
        type: 'episode',
        show: {
            id: generateId(),
        },
    };
}

function generateTestTrack(options: MockDataOptions): ReducedTrack {
    const track_id = generateId();
    return {
        name: 'Track Name',
        id: track_id,
        uri: `spotify:track:${track_id}`,
        duration_ms: 60 * 1000 + Math.random() * 180 * 1000,
        album: generateTestAlbum(options),
        explicit: false,
        type: 'track',
        artists: [generateTestArtist()],
        popularity: Math.ceil(Math.random() * 100),
    };
}

function generateTestTrackInfo(options: MockDataOptions): ReducedPlaylistedTrack {
    return {
        track: Math.random() < 0.8 ? generateTestTrack(options) : generateTestEpisode(),
    };
}

function generateTestPlaylist(options: MockDataOptions): PlaylistWithTracks {
    const playlist_id = generateId();
    const trackCount = generateInt(options.amountOfTracks)
    return {
        collaborative: false,
        description: `"A sample playlist description."`,
        external_urls: generateTestExternalUrls(),
        href: `https://api.spotify.com/v1/playlists/${playlist_id}`,
        id: playlist_id,
        images: [generateTestImage()],
        name: `Sample Playlist - ${playlist_id}`,
        owner: generateTestOwner(),
        primary_color: '',
        public: Math.random() < 0.9,
        snapshot_id: generateId(),
        tracks: {
            href: `https://api.spotify.com/v1/playlists/${playlist_id}/tracks`,
            total: trackCount,
        },
        type: 'playlist',
        uri: `spotify:playlist:${playlist_id}`,
        trackInfos: Array.from({ length: trackCount }, () => generateTestTrackInfo(options)),
        followers: {
            total: Math.floor(Math.random() * 10),
            href: '',
        },
    };
}

type MockDataOptions = {
    amountOfPlaylists: number;
    amountOfTracks: {
        from: number;
        to: number
    },
    yearRange: {
        from: number;
        to: number;
    };
};
describe('Generate pdf file', async () => {
    it('basic generation', async () => {
        const options: MockDataOptions = {
            amountOfPlaylists: 2,
            amountOfTracks: {
                from: 10,
                to: 30
            },
            yearRange: {
                from: 1960,
                to: 2024,
            },
        };
    
        const generatedPlaylists = Array.from({ length: options.amountOfPlaylists }, () => generateTestPlaylist(options));
    
        const pdf = await generatePdf(generatedPlaylists, async ({ progress, section }) => {
            console.log(`${section} : ${progress}% - ${new Date().toLocaleString('de')}`);
        });

        const folderPath = path.join(process.cwd(), 'generated');
        const filePath = path.join(folderPath, 'generate.pdf');
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }
        pdf.save(filePath);
      })

});
