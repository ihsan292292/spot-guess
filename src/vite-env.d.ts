/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/react" />
/// <reference types="vite-plugin-pwa/info" />
/// <reference lib="webworker" />
interface ImportMetaEnv {
  readonly VITE_SPOTIFY_CLIENT_ID: string;
  readonly VITE_REDIRECT_TARGET: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_SENTRY_DSN: string;
}
