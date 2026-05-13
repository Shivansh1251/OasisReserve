import { clearTokens, request, setTokens } from './client';

export async function login(credentials) {
  const payload = await request('/api/users/login', {
    method: 'POST',
    skipAuthRefresh: true,
    body: JSON.stringify(credentials),
  });

  if (payload.tokens) {
    setTokens(payload.tokens);
  }

  return payload;
}

export async function signup(details) {
  // Ensure client does not attempt to set role on signup
  const safeDetails = { ...details };
  if (safeDetails.role) delete safeDetails.role;

  const payload = await request('/api/users/signup', {
    method: 'POST',
    skipAuthRefresh: true,
    body: JSON.stringify(safeDetails),
  });

  if (payload.tokens) {
    setTokens(payload.tokens);
  }

  return payload;
}

export async function fetchCurrentUser() {
  return request('/api/users/me');
}

export async function logout() {
  try {
    await request('/api/users/logout', {
      method: 'POST',
    });
  } finally {
    clearTokens();
  }
}