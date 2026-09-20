import { setAuthTokenGetter, setBaseUrl } from '@workspace/api-client-react';
import { getAccessToken } from './auth-session';

// Host (scheme + domain + port) of the ASP.NET API. Overridable per
// environment via VITE_API_URL; plain `npm run dev` targets local :5000.
setBaseUrl(import.meta.env.VITE_API_URL ?? 'http://localhost:5000');

// Attach the in-memory access token to every API call that doesn't already
// carry an explicit Authorization header.
setAuthTokenGetter(() => getAccessToken());
