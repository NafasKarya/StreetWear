// In-memory token manager (tab-scoped, aman dari XSS dibanding localStorage)
type TokenState = {
  token: string | null;
  accessExp: number | null;   // ms epoch
  refreshExp: number | null;  // ms epoch (informational only)
};

const state: TokenState = { token: null, accessExp: null, refreshExp: null };

// 9 menit sblm expired (dari 10 jam), kamu bisa atur sesukanya
const SOFT_REFRESH_WINDOW_MS = 9 * 60 * 1000;

export function getAdminAccessToken() {
  return state.token;
}

export function setAdminAccessToken(token: string, accessExpiresAt: string, refreshExpiresAt?: string) {
  state.token = token || null;
  state.accessExp = token ? new Date(accessExpiresAt).getTime() : null;
  state.refreshExp = refreshExpiresAt ? new Date(refreshExpiresAt).getTime() : null;
}

export function clearAdminAccessToken() {
  state.token = null;
  state.accessExp = null;
  state.refreshExp = null;
}

export function isAccessTokenNearExpiry() {
  if (!state.accessExp) return true;
  const now = Date.now();
  return state.accessExp - now <= SOFT_REFRESH_WINDOW_MS;
}
