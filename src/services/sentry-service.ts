import { useEffect } from "react";
import {
  createBrowserRouter,
  createRoutesFromChildren,
  matchRoutes,
  useLocation,
  useNavigationType,
} from "react-router-dom";
import { 
  reactRouterV6BrowserTracingIntegration, 
  wrapCreateBrowserRouterV7,
  BrowserClient, 
  makeFetchTransport, 
  defaultStackParser, 
  getCurrentScope ,
  breadcrumbsIntegration,
  globalHandlersIntegration,
  linkedErrorsIntegration,
  dedupeIntegration
} from "@sentry/react";

const client = new BrowserClient({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  transport: makeFetchTransport,
  stackParser: defaultStackParser,
  integrations: [
    breadcrumbsIntegration(),
    globalHandlersIntegration(),
    linkedErrorsIntegration(),
    dedupeIntegration(),
    reactRouterV6BrowserTracingIntegration({
      useEffect: useEffect,
      useLocation,
      useNavigationType,
      createRoutesFromChildren,
      matchRoutes,
    }),
  ],
});

getCurrentScope().setClient(client);
client.init();

export const sentryCreateBrowserRouter = wrapCreateBrowserRouterV7(createBrowserRouter);
