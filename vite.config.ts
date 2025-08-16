import { sentryVitePlugin } from "@sentry/vite-plugin";
import react from "@vitejs/plugin-react";
import process from "node:process";
import { defineConfig, loadEnv } from "vite";
import { VitePWA } from 'vite-plugin-pwa'
import { visualizer } from "rollup-plugin-visualizer";
import { displayNetworkUrlWithHostnamePlugin } from './config/vite-plugins/vite-display-network-url-hostname-plugin';
import { selfSignedHttpsSupportPlugin } from './config/vite-plugins/vite-self-signed-https-support-plugin';
// import { pwaImageGenPlugin } from './config/vite-plugins/vite-pwa-image-gen-plugin';
import {fontSubsetPlugin} from './config/vite-plugins/vite-custom-font-subset-base64';

const isSentryDisabled = !(process.env.SENTRY_PLUGIN_ENABLED == "true")

const externalLibs = ['canvg', 'html2canvas', 'dompurify']; // Exclude from bundling and dependency optimization

// https://vite.dev/config/
export default ({ mode }: {mode: never}) => {
  const {
    VITE_APP_NAME
  } = loadEnv(mode, process.cwd());

  return defineConfig({
      base: "/little-gitster-girl",
      build: {
        sourcemap: true,
        rollupOptions: {
          external: externalLibs,
        },
      },
      optimizeDeps: {
        exclude: externalLibs,
      },
      plugins: [
        !isSentryDisabled && sentryVitePlugin({
          org: process.env.SENTRY_ORG,
          project: process.env.SENTRY_PROJECT,
          authToken: process.env.SENTRY_AUTH_TOKEN,
          disable: isSentryDisabled, // Seems like the sentry-vite-plugin not perfectly adapts to the disable option: https://github.com/getsentry/sentry-javascript-bundler-plugins/blob/main/packages/bundler-plugin-core/src/index.ts#L83-L101
        }),
        visualizer({
          template: "treemap",
          open: false,
          gzipSize: true,
          brotliSize: true,
          filename: "generated/analyse.html",
        }),
        react(),
        fontSubsetPlugin({
          fontPath: "./assets/fonts/NEONLEDLightRegular.ttf",
          subsetChars: Array.from(new Set(VITE_APP_NAME.toUpperCase().split(""))).join(""),
          fontFaceOptions: {
            fontFamily: "NEON LED Light",
          },
          injection: {
            type: "inject"
          }
        }),
        displayNetworkUrlWithHostnamePlugin(),
        selfSignedHttpsSupportPlugin(),
        // pwaImageGenPlugin({
        //   outputDir: "public",
        //   images: [
        //     {
        //       path: "assets/logo_512x512.png",
        //       transparent: {
        //         sizes: [64, 192, 512],
        //       },
        //       maskable: {
        //         sizes: [512],
        //       },
        //       apple: {
        //         sizes: [512],
        //       },
        //       options: {
        //         maskable: {
        //           padding: 0.0,
        //           resizeOptions: { fit: "contain", background: "white" },
        //         },
        //       }
        //     },
        //   ],
        //   favicon: {
        //     path: "public/favicon.ico",
        //     size: 48,
        //   },
        // }),
        VitePWA({
          registerType: "autoUpdate",
          includeAssets: ['favicon.ico'],
          manifest: {
            "short_name": VITE_APP_NAME,
            "name": VITE_APP_NAME,
            "icons": [
                {
                  src: 'pwa-64x64.png',
                  sizes: '64x64',
                  type: 'image/png'
                },
                {
                  src: 'pwa-192x192.png',
                  sizes: '192x192',
                  type: 'image/png'
                },
                {
                  src: 'pwa-512x512.png',
                  sizes: '512x512',
                  type: 'image/png',
                  purpose: 'any'  
                },
                {
                  src: 'maskable-icon-512x512.png',
                  sizes: '512x512',
                  type: 'image/png',
                  purpose: 'maskable'
                }
            ],
            "start_url": "/little-gitster-girl/",
            "display": "standalone",
            "theme_color": "#000000",
            "background_color": "#ffffff"
          },
          includeManifestIcons: true,
        })
      ],
      preview: {
        port: 3000,
        strictPort: true,
        host: true
      },
      server: {
        port: 3000,
        strictPort: true,
        host: true
      },
      worker: {
        format: 'es',
        rollupOptions: {
          external: externalLibs,
        },
      }
    });
};
