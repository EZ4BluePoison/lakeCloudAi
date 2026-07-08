import type { User } from '@/types';

const AUTH_BASE = '/api/auth';
const ADMIN_BASE = '/api/admin';
const TOKEN_KEY = 'lakecloud-access-token';

export interface AuthResult {
  token: string;
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

export function getApiToken(): string | undefined {
  try {
    return localStorage.getItem(TOKEN_KEY) || undefined;
  } catch {
    return undefined;
  }
}

export function setApiToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // ignore
  }
}

export function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  const token = getApiToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

function getJsonAuthHeaders(): Record<string, string> {
  return { 'Content-Type': 'application/json', ...getAuthHeaders() };
}

export async function fetchJson<T>(input: string, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: {
      ...getAuthHeaders(),
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
    const wrapper = data as { code: string; message?: string; data?: T };
    if (wrapper.code !== '0' && wrapper.code !== '200') {
      throw new Error(wrapper.message || `业务错误 ${wrapper.code}`);
    }
    return wrapper.data as T;
  }
  return data as T;
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

export function evalExpression(expr: string): string {
  // 后端仅返回 + - * / 整数表达式
  const sanitized = expr.replace(/[^0-9+\-*/().\s]/g, '');
  if (!sanitized) return '';
  try {
    // eslint-disable-next-line no-new-func
    return String(new Function('return (' + sanitized + ')')());
  } catch {
    return '';
  }
}

export interface CaptchaInfo {
  captchaKey: string;
  expression: string;
  answer: string;
}

export async function fetchCaptcha(): Promise<CaptchaInfo> {
  const data = await fetchJson<{ expression: string; captchaKey: string }>(`${AUTH_BASE}/captcha/generate`);
  return {
    captchaKey: data.captchaKey,
    expression: data.expression,
    answer: evalExpression(data.expression),
  };
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export async function login(credentials: LoginCredentials): Promise<AuthResult> {
  const captcha = await fetchCaptcha();
  const tenantId = import.meta.env.VITE_DEFAULT_TENANT_ID || '1';

  const loginResp = await fetchJson<{
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
      captchaKey: captcha.captchaKey,
      captchaCode: captcha.answer,
    }),
  });

  const token = loginResp.accessToken;
  setApiToken(token);

  const payload = parseJwt(token) || {};
  const userId = loginResp.userId || payload.sub || payload.userId || '';

  const user = await getCurrentUser(userId);
  const roles = payload.roles || [];
  const permissions = payload.permissions || [];

  return { token, user, roles, permissions };
}

export async function refreshToken(): Promise<AuthResult> {
  const resp = await fetchJson<{ accessToken: string; userId: string; tenantId: string; username: string }>(
    `${AUTH_BASE}/refresh`,
    { method: 'POST', headers: getJsonAuthHeaders() }
  );
  setApiToken(resp.accessToken);
  const payload = parseJwt(resp.accessToken) || {};
  const userId = resp.userId || payload.sub || payload.userId || '';
  const user = await getCurrentUser(userId);
  return {
    token: resp.accessToken,
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
    setApiToken(null);
  }
}
