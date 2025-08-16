export interface SpotifyError {
    status: number;
    message: string;
    reason?: string;
}

export const isSpotifyError = (error: unknown): error is SpotifyError => {
    return (
        typeof error === "object" &&
        error !== null &&
        'status' in error &&
        typeof (error as SpotifyError).status === 'number' &&
        'message' in error &&
        typeof (error as SpotifyError).message === 'string'
    );
};