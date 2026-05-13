const ACCESS_TOKEN_KEY = 'oasisreserve_access_token';
const REFRESH_TOKEN_KEY = 'oasisreserve_refresh_token';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

class ApiError extends Error {
  constructor(message, status, payload) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

function isBrowser() {
  return typeof window !== 'undefined';
}

function resolveUrl(path) {
  if (!API_BASE_URL || /^https?:\/\//i.test(path)) {
    return path;
  }

  if (path.startsWith('/')) {
    return `${API_BASE_URL.replace(/\/$/, '')}${path}`;
  }

  return `${API_BASE_URL.replace(/\/$/, '')}/${path}`;
}

export function getTokens() {
  if (!isBrowser()) {
    return { accessToken: null, refreshToken: null };
  }

  return {
    accessToken: window.localStorage.getItem(ACCESS_TOKEN_KEY),
    refreshToken: window.localStorage.getItem(REFRESH_TOKEN_KEY),
  };
}

export function setTokens(tokens) {
  if (!isBrowser()) return;

  if (tokens.accessToken) {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  }

  if (tokens.refreshToken) {
    window.localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  }
}

export function clearTokens() {
  if (!isBrowser()) return;

  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
}

async function parseResponse(response) {
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    return response.json();
  }

  return response.text();
}

async function refreshSession() {
  const { refreshToken } = getTokens();

  if (!refreshToken) {
    throw new ApiError('No refresh token available', 401);
  }

  const response = await fetch(resolveUrl('/api/users/refresh'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  const payload = await parseResponse(response);

  if (!response.ok) {
    clearTokens();
    throw new ApiError(payload?.error || 'Session refresh failed', response.status, payload);
  }

  setTokens(payload.tokens);
  return payload;
}

export async function request(path, options = {}) {
  const { skipAuthRefresh = false, ...fetchOptions } = options;
  const headers = new Headers(fetchOptions.headers || {});
  const { accessToken, refreshToken } = getTokens();

  if (accessToken && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  if (!headers.has('Content-Type') && fetchOptions.body && !(fetchOptions.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const resolvedPath = resolveUrl(path);

  let response = await fetch(resolvedPath, {
    ...fetchOptions,
    headers,
  });

  if (response.status === 401 && refreshToken && !skipAuthRefresh && !path.includes('/api/users/refresh')) {
    await refreshSession();
    const updatedTokens = getTokens();

    if (updatedTokens.accessToken) {
      headers.set('Authorization', `Bearer ${updatedTokens.accessToken}`);
    }

    response = await fetch(resolvedPath, {
      ...fetchOptions,
      headers,
    });
  }

  const payload = await parseResponse(response);

  if (!response.ok) {
    throw new ApiError(payload?.error || 'Request failed', response.status, payload);
  }

  return payload;
}

export function hasSession() {
  const { accessToken, refreshToken } = getTokens();
  return Boolean(accessToken || refreshToken);
}

export { ApiError };