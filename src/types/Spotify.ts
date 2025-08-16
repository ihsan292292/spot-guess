import type { TrackReference, SimplifiedAlbum, SimplifiedShow, Track, Episode, SimplifiedPlaylist, Image } from '@spotify/web-api-ts-sdk';

export type SimplifiedPlaylistTracksRequired = Omit<SimplifiedPlaylist, "images"> & {
    tracks: TrackReference;
    images?: Image[];
}

export type ReducedEpisode = Pick<Episode, "type"> & {show: Pick<SimplifiedShow, "id">};  
export type ReducedSimplifiedAlbum = Pick<SimplifiedAlbum, "id" | "name" | "album_type" | "total_tracks" | "release_date" | "release_date_precision">     
export type ReducedTrack = Pick<Track, "id" | "uri" | "name" | "duration_ms" | "explicit" | "artists" | "type" | "popularity"> & {album: ReducedSimplifiedAlbum}      
export type ReducedTrackItem = ReducedTrack | ReducedEpisode
export type ReducedPlaylistedTrack<T extends ReducedTrackItem = ReducedTrackItem> = {track: T}
export type PlaylistWithTracks = SimplifiedPlaylistTracksRequired & { trackInfos: ReducedPlaylistedTrack[] };
