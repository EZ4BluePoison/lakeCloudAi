import { fetchJson } from './authService';
import type { User, Organization, Role, Permission, PermissionCategoryGroup } from '@/types';

const ADMIN_BASE = '/api/admin';

export interface PageParams {
  page?: number;
  size?: number;
  keyword?: string;
  [key: string]: unknown;
}

export interface PageResult<T> {
  pageNo: number;
  pageSize: number;
  total: number;
  records: T[];
}

function buildQuery(params?: Record<string, unknown>): string {
  if (!params) return '';
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return;
    qs.append(k, String(v));
  });
  return qs.toString() ? `?${qs.toString()}` : '';
}

// ==================== Users ====================

export interface CreateUserPayload {
  username: string;
  displayName: string;
  password: string;
  email?: string;
  phone?: string;
  organizationId?: string;
  roleIds?: string[];
}

export interface UpdateUserPayload {
  displayName?: string;
  email?: string;
  phone?: string;
  organizationId?: string;
  roleIds?: string[];
}

export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
}

function mapUser(raw: Record<string, unknown>): User {
  return {
    id: String(raw.id),
    username: String(raw.username || ''),
    displayName: String(raw.displayName || ''),
    email: raw.email as string | undefined,
    phone: raw.phone as string | undefined,
    organizationId: raw.organizationId != null ? String(raw.organizationId) : undefined,
    status: String(raw.status) as User['status'],
    tenantId: raw.tenantId as string | undefined,
    createdAt: raw.createdAt as string | undefined,
    updatedAt: raw.updatedAt as string | undefined,
  };
}

async function listUsers(params?: PageParams): Promise<PageResult<User>> {
  const data = await fetchJson<{ pageNo: number; pageSize: number; total: number; records: Record<string, unknown>[] }>(
    `${ADMIN_BASE}/users${buildQuery(params)}`
  );
  return { ...data, records: data.records.map(mapUser) };
}

async function getUser(userId: string): Promise<User> {
  return mapUser(await fetchJson<Record<string, unknown>>(`${ADMIN_BASE}/users/${userId}`));
}

async function createUser(payload: CreateUserPayload): Promise<User> {
  const body = {
    ...payload,
    organizationId: payload.organizationId ? Number(payload.organizationId) : undefined,
    roleIds: payload.roleIds?.map((id) => Number(id)),
  };
  return mapUser(await fetchJson<Record<string, unknown>>(`${ADMIN_BASE}/users`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }));
}

async function updateUser(userId: string, payload: UpdateUserPayload): Promise<User> {
  const body = {
    ...payload,
    organizationId: payload.organizationId ? Number(payload.organizationId) : undefined,
    roleIds: payload.roleIds?.map((id) => Number(id)),
  };
  return mapUser(await fetchJson<Record<string, unknown>>(`${ADMIN_BASE}/users/${userId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }));
}

async function enableUser(userId: string): Promise<void> {
  await fetchJson<void>(`${ADMIN_BASE}/users/${userId}/enable`, { method: 'POST' });
}

async function disableUser(userId: string): Promise<void> {
  await fetchJson<void>(`${ADMIN_BASE}/users/${userId}/disable`, { method: 'POST' });
}

async function changePassword(userId: string, payload: ChangePasswordPayload): Promise<void> {
  await fetchJson<void>(`${ADMIN_BASE}/users/${userId}/password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

// ==================== Organizations ====================

export interface CreateOrgPayload {
  code?: string;
  name: string;
  parentId?: string;
  sortOrder?: number;
}

export interface UpdateOrgPayload {
  code?: string;
  name?: string;
  parentId?: string;
  sortOrder?: number;
}

function mapOrg(raw: Record<string, unknown>): Organization {
  return {
    id: String(raw.id),
    code: raw.code as string | undefined,
    name: String(raw.name || ''),
    parentId: raw.parentId != null ? String(raw.parentId) : undefined,
    sortOrder: raw.sortOrder as number | undefined,
    status: String(raw.status) as Organization['status'],
    tenantId: raw.tenantId as string | undefined,
    createdAt: raw.createdAt as string | undefined,
  };
}

async function listOrganizations(): Promise<Organization[]> {
  const data = await fetchJson<Record<string, unknown>[]>(`${ADMIN_BASE}/organizations`);
  return data.map(mapOrg);
}

async function getOrgTree(): Promise<Organization[]> {
  const data = await fetchJson<Record<string, unknown>[]>(`${ADMIN_BASE}/organizations/tree`);
  return data.map(mapOrgTree);
}

function mapOrgTree(raw: Record<string, unknown>): Organization {
  return {
    id: String(raw.id),
    code: raw.code as string | undefined,
    name: String(raw.name || ''),
    sortOrder: raw.sortOrder as number | undefined,
    status: 'ACTIVE',
    children: Array.isArray(raw.children) ? raw.children.map((c) => mapOrgTree(c as Record<string, unknown>)) : undefined,
  };
}

async function createOrganization(payload: CreateOrgPayload): Promise<Organization> {
  const body = {
    ...payload,
    parentId: payload.parentId ? Number(payload.parentId) : undefined,
  };
  return mapOrg(await fetchJson<Record<string, unknown>>(`${ADMIN_BASE}/organizations`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }));
}

async function updateOrganization(orgId: string, payload: UpdateOrgPayload): Promise<Organization> {
  const body = {
    ...payload,
    parentId: payload.parentId ? Number(payload.parentId) : undefined,
  };
  return mapOrg(await fetchJson<Record<string, unknown>>(`${ADMIN_BASE}/organizations/${orgId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }));
}

async function deleteOrganization(orgId: string): Promise<void> {
  await fetchJson<void>(`${ADMIN_BASE}/organizations/${orgId}`, { method: 'DELETE' });
}

async function moveOrganization(orgId: string, newParentId: string): Promise<void> {
  await fetchJson<void>(`${ADMIN_BASE}/organizations/${orgId}/move`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ newParentId: Number(newParentId) }),
  });
}

// ==================== Roles ====================

export interface CreateRolePayload {
  code: string;
  name: string;
  description?: string;
  scope?: 'PLATFORM' | 'TENANT';
}

export interface UpdateRolePayload {
  code?: string;
  name?: string;
  description?: string;
}

function mapRole(raw: Record<string, unknown>): Role {
  return {
    id: String(raw.id),
    code: String(raw.code || ''),
    name: String(raw.name || ''),
    description: raw.description as string | null | undefined,
    scope: String(raw.scope || 'TENANT') as Role['scope'],
    status: String(raw.status) as Role['status'],
    tenantId: raw.tenantId as string | undefined,
    createdAt: raw.createdAt as string | undefined,
    updatedAt: raw.updatedAt as string | undefined,
  };
}

async function listRoles(params?: PageParams): Promise<PageResult<Role>> {
  const data = await fetchJson<{ pageNo: number; pageSize: number; total: number; records: Record<string, unknown>[] }>(
    `${ADMIN_BASE}/roles${buildQuery(params)}`
  );
  return { ...data, records: data.records.map(mapRole) };
}

async function getRole(roleId: string): Promise<Role> {
  return mapRole(await fetchJson<Record<string, unknown>>(`${ADMIN_BASE}/roles/${roleId}`));
}

async function createRole(payload: CreateRolePayload): Promise<Role> {
  return mapRole(await fetchJson<Record<string, unknown>>(`${ADMIN_BASE}/roles`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }));
}

async function updateRole(roleId: string, payload: UpdateRolePayload): Promise<Role> {
  return mapRole(await fetchJson<Record<string, unknown>>(`${ADMIN_BASE}/roles/${roleId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }));
}

async function enableRole(roleId: string): Promise<void> {
  await fetchJson<void>(`${ADMIN_BASE}/roles/${roleId}/enable`, { method: 'POST' });
}

async function disableRole(roleId: string): Promise<void> {
  await fetchJson<void>(`${ADMIN_BASE}/roles/${roleId}/disable`, { method: 'POST' });
}

async function assignRoleToUser(roleId: string, userId: string): Promise<void> {
  await fetchJson<void>(`${ADMIN_BASE}/roles/${roleId}/users/${userId}`, { method: 'POST' });
}

async function revokeRoleFromUser(roleId: string, userId: string): Promise<void> {
  await fetchJson<void>(`${ADMIN_BASE}/roles/${roleId}/users/${userId}`, { method: 'DELETE' });
}

async function assignPermissions(roleId: string, permissionIds: string[]): Promise<void> {
  await fetchJson<void>(`${ADMIN_BASE}/roles/${roleId}/permissions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ permissionIds: permissionIds.map((id) => Number(id)) }),
  });
}

async function revokePermission(roleId: string, permissionId: string): Promise<void> {
  await fetchJson<void>(`${ADMIN_BASE}/roles/${roleId}/permissions/${permissionId}`, { method: 'DELETE' });
}

// ==================== Permissions ====================

export interface CreatePermissionPayload {
  code: string;
  name: string;
  description?: string;
  category: string;
}

export interface UpdatePermissionPayload {
  code: string;
  name: string;
  description?: string;
  category: string;
}

function mapPermission(raw: Record<string, unknown>): Permission {
  return {
    id: String(raw.id),
    code: String(raw.code || ''),
    name: String(raw.name || ''),
    description: raw.description as string | null | undefined,
    category: String(raw.category || ''),
    isSystem: !!raw.isSystem,
    tenantId: raw.tenantId as string | undefined,
    createdAt: raw.createdAt as string | undefined,
  };
}

async function listPermissionsGrouped(): Promise<PermissionCategoryGroup[]> {
  const data = await fetchJson<{ category: string; permissions: Record<string, unknown>[] }[]>(`${ADMIN_BASE}/permissions`);
  return data.map((g) => ({ category: g.category, permissions: g.permissions.map(mapPermission) }));
}

async function listPermissionsPaged(params?: PageParams & { category?: string }): Promise<PageResult<Permission>> {
  const data = await fetchJson<{ pageNo: number; pageSize: number; total: number; records: Record<string, unknown>[] }>(
    `${ADMIN_BASE}/permissions/page${buildQuery(params)}`
  );
  return { ...data, records: data.records.map(mapPermission) };
}

async function getPermission(permissionId: string): Promise<Permission> {
  return mapPermission(await fetchJson<Record<string, unknown>>(`${ADMIN_BASE}/permissions/${permissionId}`));
}

async function createPermission(payload: CreatePermissionPayload): Promise<Permission> {
  return mapPermission(await fetchJson<Record<string, unknown>>(`${ADMIN_BASE}/permissions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }));
}

async function updatePermission(permissionId: string, payload: UpdatePermissionPayload): Promise<Permission> {
  return mapPermission(await fetchJson<Record<string, unknown>>(`${ADMIN_BASE}/permissions/${permissionId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }));
}

async function deletePermission(permissionId: string): Promise<void> {
  await fetchJson<void>(`${ADMIN_BASE}/permissions/${permissionId}`, { method: 'DELETE' });
}

export const adminService = {
  users: {
    list: listUsers,
    get: getUser,
    create: createUser,
    update: updateUser,
    enable: enableUser,
    disable: disableUser,
    changePassword,
  },
  organizations: {
    list: listOrganizations,
    tree: getOrgTree,
    create: createOrganization,
    update: updateOrganization,
    delete: deleteOrganization,
    move: moveOrganization,
  },
  roles: {
    list: listRoles,
    get: getRole,
    create: createRole,
    update: updateRole,
    enable: enableRole,
    disable: disableRole,
    assignUser: assignRoleToUser,
    revokeUser: revokeRoleFromUser,
    assignPermissions,
    revokePermission,
  },
  permissions: {
    listGrouped: listPermissionsGrouped,
    listPaged: listPermissionsPaged,
    get: getPermission,
    create: createPermission,
    update: updatePermission,
    delete: deletePermission,
  },
};
