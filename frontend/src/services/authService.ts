import type { User } from '@/types';

const AUTH_BASE = '/api/auth';
const ADMIN_BASE = '/api/admin';
const TOKEN_KEY = 'lakecloud-access-token';

export interface AuthResult {
  /** 登录接口返回的 accessToken */
  accessToken: string;
  user: User;
  roles: string[];
  permissions: string[];
}

export interface JwtPayload {
  sub?: string;
  userId?: string;
  username?: string;
  tenant_id?: string;
  tenantId?: string;
  roles?: string[];
  permissions?: string[];
  exp?: number;
  type?: string;
}

export function getAccessToken(): string | undefined {
  try {
    return localStorage.getItem(TOKEN_KEY) || undefined;
  } catch {
    return undefined;
  }
}

/** 兼容旧命名的别名 */
export const getApiToken = getAccessToken;

export function setAccessToken(accessToken: string | null): void {
  try {
    if (accessToken) {
      localStorage.setItem(TOKEN_KEY, accessToken);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // ignore
  }
}

/** 兼容旧命名的别名 */
export const setApiToken = setAccessToken;

export function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  const accessToken = getAccessToken();
  if (accessToken) {
    // 远程后端要求直接传 token，不带 Bearer 前缀
    headers.Authorization = accessToken;
  }
  return headers;
}

function getJsonAuthHeaders(): Record<string, string> {
  return { 'Content-Type': 'application/json', ...getAuthHeaders() };
}

async function fetchRawJson<T>(input: string, init: RequestInit | undefined, withAuth: boolean): Promise<T> {
  const authHeaders = withAuth ? getAuthHeaders() : {};
  const res = await fetch(input, {
    ...init,
    headers: {
      ...authHeaders,
      ...(init?.headers || {}),
    },
  });
  const text = await res.text();
  let data: unknown;
  try {
    data = text ? JSON.parse(text) : undefined;
  } catch {
    data = text;
  }
  if (!res.ok) {
    const errMsg =
      typeof data === 'object' && data !== null && 'message' in data
        ? String((data as { message?: string }).message)
        : `HTTP ${res.status}`;
    throw new Error(errMsg || '请求失败');
  }
  if (typeof data === 'object' && data !== null && 'code' in data) {
    const wrapper = data as { code: string | number; message?: string; data?: T };
    const code = String(wrapper.code);
    if (code !== '0' && code !== '200') {
      throw new Error(wrapper.message || `业务错误 ${code}`);
    }
    return wrapper.data as T;
  }
  return data as T;
}

/** 需要登录态的请求（会携带 accessToken） */
export async function fetchJson<T>(input: string, init?: RequestInit): Promise<T> {
  return fetchRawJson<T>(input, init, true);
}

/** 登录前的公开接口（不会携带 accessToken，避免旧 token 干扰登录/验证码） */
export async function fetchPublicJson<T>(input: string, init?: RequestInit): Promise<T> {
  return fetchRawJson<T>(input, init, false);
}

export function parseJwt(token: string): JwtPayload | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

export interface CaptchaInfo {
  captchaKey: string;
  captchaImage: string;
}

export async function fetchCaptcha(): Promise<CaptchaInfo> {
  const data = await fetchPublicJson<{ captchaImage: string; captchaKey: string }>(`${AUTH_BASE}/captcha/generate`);
  return {
    captchaKey: data.captchaKey,
    captchaImage: data.captchaImage,
  };
}

export interface LoginCredentials {
  username: string;
  password: string;
  captchaCode: string;
  captchaKey: string;
}

export async function login(credentials: LoginCredentials): Promise<AuthResult> {
  const tenantId = import.meta.env.VITE_DEFAULT_TENANT_ID || 'system';

  const loginResp = await fetchPublicJson<{
    accessToken: string;
    userId: string;
    tenantId: string;
    username: string;
  }>(`${AUTH_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tenantId,
      username: credentials.username,
      password: credentials.password,
      captchaKey: credentials.captchaKey,
      captchaCode: credentials.captchaCode,
    }),
  });

  const accessToken = loginResp.accessToken;
  setAccessToken(accessToken);

  const payload = parseJwt(accessToken) || {};
  const userId = loginResp.userId || payload.sub || payload.userId || '';

  const user = await getCurrentUser(userId);
  const roles = payload.roles || [];
  const permissions = payload.permissions || [];

  return { accessToken, user, roles, permissions };
}

export async function refreshToken(): Promise<AuthResult> {
  const resp = await fetchJson<{ accessToken: string; userId: string; tenantId: string; username: string }>(
    `${AUTH_BASE}/refresh`,
    { method: 'POST', headers: getJsonAuthHeaders() }
  );
  setAccessToken(resp.accessToken);
  const payload = parseJwt(resp.accessToken) || {};
  const userId = resp.userId || payload.sub || payload.userId || '';
  const user = await getCurrentUser(userId);
  return {
    accessToken: resp.accessToken,
    user,
    roles: payload.roles || [],
    permissions: payload.permissions || [],
  };
}

export async function getCurrentUser(userId: string): Promise<User> {
  const data = await fetchJson<{
    id: number;
    username: string;
    displayName: string;
    email?: string | null;
    phone?: string | null;
    organizationId?: number | null;
    status: 'ACTIVE' | 'DISABLED';
    tenantId?: string;
    createdAt?: string;
    updatedAt?: string;
  }>(`${ADMIN_BASE}/users/${userId}`);
  return {
    id: String(data.id),
    username: data.username,
    displayName: data.displayName,
    email: data.email,
    phone: data.phone,
    organizationId: data.organizationId != null ? String(data.organizationId) : undefined,
    status: data.status,
    tenantId: data.tenantId,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

export async function logout(): Promise<void> {
  try {
    await fetchJson<void>(`${AUTH_BASE}/logout`, {
      method: 'POST',
      headers: getJsonAuthHeaders(),
    });
  } finally {
    setAccessToken(null);
  }
}
