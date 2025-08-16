import { ProgressUpdate } from "../../services/playlist-pdf-generator";
import { PlaylistWithTracks } from "../../types/Spotify";

export type GeneratePdfPayload = {
    playlists: Array<PlaylistWithTracks>,
};
export type WorkerMessage = {
    action: 'generatePdf';
    payload: GeneratePdfPayload;
}

export type WorkerResponse = WorkerProgressResponse | WorkerCompleteResponse;

export interface WorkerProgressResponse {
  type: "progress";
  payload: ProgressUpdate;
}

export interface WorkerCompleteResponse {
  type: "complete";
  payload: {
    success: boolean;
    pdf?: Blob;
    error?: string;
  }
}