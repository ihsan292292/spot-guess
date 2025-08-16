import { lazy } from 'react';

/**
 * Current workaround for the following issue:
 * Fast refresh only works when a file has exports. Move your component(s) to a separate file.eslint(react-refresh/only-export-components)
 */
export const GameLazy = lazy(() => import('../routes/Game'));
export const GenerateCodesLazy = lazy(() => import('../routes/GenerateCodes'));
