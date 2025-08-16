

import { sentryCreateBrowserRouter } from './services/sentry-service';

import { Suspense, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom';

import App from './routes/App';
import NotFound from './routes/NotFound';
import ErrorComponent from './routes/ErrorComponent';
import ProtectedRoute from './routes/ProtectedRoute';

import { TranslationProvider } from './i18n';
import { SpotifyAuthProvider } from './auth';
import { ToastProvider } from './context/Toast';
import { SpotifyPlayerContextProvider } from './context/SpotifyWebPlayerContext';

import './index.css';
import LoadingSpinner from './components/LoadingSpinner';
import { GameLazy, GenerateCodesLazy } from './routes/lazy';

const router = sentryCreateBrowserRouter(
    [
        {
            path: '/',
            element: <App />,
            children: [
                {
                    path: '/game',
                    element: (
                        <ProtectedRoute>
                            <Suspense fallback={<LoadingSpinner/>}>
                                <GameLazy />
                            </Suspense>
                        </ProtectedRoute>
                    ),
                },
                {
                    path: '/generate',
                    element: (
                        <ProtectedRoute>
                            <Suspense fallback={<LoadingSpinner/>}>
                                <GenerateCodesLazy />
                            </Suspense>
                        </ProtectedRoute>
                    ),
                },
                {
                    path: '*',
                    element: <NotFound />,
                },
            ],
            errorElement: <ErrorComponent />,
        },
    ],
    { basename: import.meta.env.BASE_URL }
);

//using react 17 because of --> https://community.spotify.com/t5/Spotify-for-Developers/Spotify-Web-Playback-SDK-example-playback-buttons-don-t-work/td-p/5516960?hwSuccess=1682633176302
createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <TranslationProvider>
            <SpotifyAuthProvider>
                <SpotifyPlayerContextProvider>
                    <ToastProvider>
                        <RouterProvider router={router} />
                    </ToastProvider>
                </SpotifyPlayerContextProvider>
            </SpotifyAuthProvider>
        </TranslationProvider>
    </StrictMode>
);
