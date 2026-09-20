import {
  getMe,
  login as apiLogin,
  logout as apiLogout,
  refreshSession as apiRefresh,
  register as apiRegister,
} from '@workspace/api-client-react';
import type {
  LoginRequest,
  MeUserDto,
  RegisterRequest,
} from '@workspace/api-client-react';

// The refresh token lives in an httpOnly cookie, so every cookie-touching
// call must opt into credentials. The access token goes on Authorization
// via the getter registered in ./api.
const withCookies = { credentials: 'include' } as const;

let accessToken: string | null = null;

/** Current in-memory access token (null until login/register/restore). */
export function getAccessToken(): string | null {
  return accessToken;
}

export async function loginAccount(input: LoginRequest): Promise<MeUserDto> {
  const res = await apiLogin(input, withCookies);
  accessToken = res.tokens.accessToken;
  return fetchProfile();
}

export async function registerAccount(
  input: RegisterRequest,
): Promise<MeUserDto> {
  const res = await apiRegister(input, withCookies);
  accessToken = res.tokens.accessToken;
  return fetchProfile();
}

/** Exchange the refresh cookie for a fresh access token + profile. */
export async function restoreSession(): Promise<MeUserDto | null> {
  try {
    const res = await apiRefresh(withCookies);
    accessToken = res.tokens.accessToken;
    return await fetchProfile();
  } catch {
    accessToken = null;
    return null;
  }
}

export async function fetchProfile(): Promise<MeUserDto> {
  const res = await getMe();
  return res.user;
}

export async function logoutAccount(): Promise<void> {
  try {
    await apiLogout(withCookies);
  } catch {
    // Server already forgot us or is unreachable — clear local state anyway.
  }
  accessToken = null;
}

export interface ApiErrorInfo {
  status: number | null;
  /** Stable backend error slug, e.g. validation_failed, unauthenticated. */
  type: string | null;
  /** Field errors keyed by lowercase field name. */
  fields: Record<string, string[]>;
  message: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function defaultMessage(status: number, type: string | null): string {
  if (status === 401 || type === 'unauthenticated')
    return 'Wrong email or password.';
  if (status === 409 || type === 'already_registered')
    return 'An account with these details already exists. Try logging in instead.';
  if (status === 429 || type === 'rate_limited')
    return 'Too many attempts. Please wait a little and try again.';
  return 'Something went wrong. Please try again.';
}

/**
 * Normalise a thrown fetch error (ApiError from the generated client) into
 * a stable shape the UI can render. Duck-typed so it doesn't depend on the
 * error class, which the client package doesn't re-export.
 */
export function toApiErrorInfo(error: unknown): ApiErrorInfo {
  const fallback: ApiErrorInfo = {
    status: null,
    type: null,
    fields: {},
    message: 'Something went wrong. Please try again.',
  };
  if (!isRecord(error) || typeof error.status !== 'number') return fallback;
  const data = isRecord(error.data) ? error.data : {};
  const type = typeof data.type === 'string' ? data.type : null;
  const fields: Record<string, string[]> = {};
  if (isRecord(data.errors)) {
    for (const [key, value] of Object.entries(data.errors)) {
      const messages = Array.isArray(value)
        ? value.filter((v): v is string => typeof v === 'string')
        : [];
      if (messages.length > 0) fields[key.toLowerCase()] = messages;
    }
  }
  const message =
    typeof data.title === 'string' && data.title !== ''
      ? data.title
      : defaultMessage(error.status, type);
  return { status: error.status, type, fields, message };
}
