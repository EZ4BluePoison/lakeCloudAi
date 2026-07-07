import type {
  User,
  Department,
  Role,
  Permission,
  PermissionCode,
  OAuth2CallbackParams,
} from '@/types';

const API_BASE_URL = '/auth-api';

function getApiToken(): string | undefined {
  try {
    const envToken = import.meta.env.VITE_API_TOKEN;
    if (typeof envToken === 'string' && envToken && !envToken.startsWith('YOUR_')) {
      return envToken;
    }
    return localStorage.getItem('lakecloud-api-token') || undefined;
  } catch {
    return undefined;
  }
}

function setApiToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem('lakecloud-api-token', token);
    } else {
      localStorage.removeItem('lakecloud-api-token');
    }
  } catch {
    // ignore
  }
}

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  const token = getApiToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

function getJsonAuthHeaders(): Record<string, string> {
  return { 'Content-Type': 'application/json', ...getAuthHeaders() };
}

async function fetchJson<T>(input: string, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`request failed: ${res.status} ${text}`);
  }
  const json = (await res.json()) as unknown;
  return json as T;
}

const MOCK_ENABLED = import.meta.env.VITE_MOCK_AUTH === 'true';

function maybeMock<T>(factory: () => T, message: string): T {
  if (MOCK_ENABLED || import.meta.env.DEV) {
    console.warn(`[AuthService] ${message} — using mock data`);
    return factory();
  }
  throw new Error(message);
}

// ==================== Mock Data ====================

const mockCurrentUser: User = {
  id: 'u-001',
  name: '张经理',
  username: 'zhangjl',
  employeeNo: 'GL001',
  phone: '13800000001',
  email: 'zhangjl@example.com',
  departmentId: 'd-001',
  departmentName: '数字化部',
  roleIds: ['r-admin'],
  status: 'active',
};

const mockUsers: User[] = [
  mockCurrentUser,
  {
    id: 'u-002',
    name: '李员工',
    username: 'liyg',
    employeeNo: 'GL002',
    departmentId: 'd-002',
    departmentName: '财务部',
    roleIds: ['r-user'],
    status: 'active',
  },
  {
    id: 'u-003',
    name: '王主管',
    username: 'wangzg',
    employeeNo: 'GL003',
    departmentId: 'd-003',
    departmentName: '人力资源部',
    roleIds: ['r-manager'],
    status: 'active',
  },
];

const mockDepartments: Department[] = [
  {
    id: 'd-001',
    name: '数字化部',
    code: 'DIG',
    level: 1,
    children: [
      { id: 'd-001-1', name: '平台研发组', code: 'DIG-RD', parentId: 'd-001', level: 2 },
      { id: 'd-001-2', name: 'AI 实验室', code: 'DIG-AI', parentId: 'd-001', level: 2 },
    ],
  },
  { id: 'd-002', name: '财务部', code: 'FIN', level: 1 },
  { id: 'd-003', name: '人力资源部', code: 'HR', level: 1 },
];

const mockPermissions: Permission[] = [
  { code: 'user:view', name: '查看用户', group: '用户管理' },
  { code: 'user:create', name: '新增用户', group: '用户管理' },
  { code: 'user:edit', name: '编辑用户', group: '用户管理' },
  { code: 'user:delete', name: '删除用户', group: '用户管理' },
  { code: 'org:view', name: '查看组织', group: '组织架构' },
  { code: 'org:create', name: '新增组织', group: '组织架构' },
  { code: 'org:edit', name: '编辑组织', group: '组织架构' },
  { code: 'org:delete', name: '删除组织', group: '组织架构' },
  { code: 'role:view', name: '查看角色', group: '角色权限' },
  { code: 'role:create', name: '新增角色', group: '角色权限' },
  { code: 'role:edit', name: '编辑角色', group: '角色权限' },
  { code: 'role:delete', name: '删除角色', group: '角色权限' },
  { code: 'agent:view', name: '查看智能体', group: '智能体' },
  { code: 'agent:create', name: '新建智能体', group: '智能体' },
  { code: 'knowledge:view', name: '查看知识库', group: '知识库' },
  { code: 'knowledge:create', name: '创建知识库', group: '知识库' },
  { code: 'app:view', name: '查看应用', group: '应用' },
  { code: 'app:create', name: '创建应用', group: '应用' },
];

const mockRoles: Role[] = [
  {
    id: 'r-admin',
    name: '系统管理员',
    code: 'admin',
    description: '拥有全部权限',
    permissionCodes: mockPermissions.map(p => p.code),
    userCount: 1,
  },
  {
    id: 'r-manager',
    name: '部门负责人',
    code: 'manager',
    description: '管理部门知识和审批',
    permissionCodes: [
      'user:view',
      'org:view',
      'role:view',
      'agent:view',
      'agent:create',
      'knowledge:view',
      'knowledge:create',
      'app:view',
    ],
    userCount: 1,
  },
  {
    id: 'r-user',
    name: '普通员工',
    code: 'user',
    description: '基础使用权限',
    permissionCodes: [
      'agent:view',
      'knowledge:view',
      'app:view',
    ],
    userCount: 1,
  },
];

// ==================== Auth API ====================

export interface AuthResult {
  token: string;
  user: User;
  permissions: PermissionCode[];
  roles: string[];
}

export function getOAuth2Url(): string {
  const base = import.meta.env.VITE_OAUTH2_AUTHORIZE_URL || `${API_BASE_URL}/oauth2/authorize`;
  const clientId = import.meta.env.VITE_OAUTH2_CLIENT_ID || 'lakecloud-ai';
  const redirectUri = encodeURIComponent(
    import.meta.env.VITE_OAUTH2_REDIRECT_URI || `${window.location.origin}/oauth2/callback`
  );
  return `${base}?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&scope=profile`;
}

export async function exchangeCode(params: OAuth2CallbackParams): Promise<AuthResult> {
  try {
    const result = await fetchJson<AuthResult>(`${API_BASE_URL}/oauth2/token`, {
      method: 'POST',
      headers: getJsonAuthHeaders(),
      body: JSON.stringify(params),
    });
    setApiToken(result.token);
    return result;
  } catch (err) {
    console.warn('[AuthService] exchangeCode failed:', err);
    return maybeMock(
      () => {
        const token = 'mock-token-' + Date.now();
        setApiToken(token);
        return {
          token,
          user: mockCurrentUser,
          permissions: mockPermissions.map(p => p.code),
          roles: ['admin'],
        };
      },
      'OAuth2 token exchange unavailable'
    );
  }
}

export async function refreshToken(): Promise<AuthResult> {
  try {
    const result = await fetchJson<AuthResult>(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    setApiToken(result.token);
    return result;
  } catch (err) {
    console.warn('[AuthService] refreshToken failed:', err);
    return maybeMock(
      () => {
        const token = getApiToken() || 'mock-token';
        const role = parseMockRoleFromToken(token);
        if (role) {
          const result = getMockLoginResult(role);
          return { ...result, token };
        }
        return {
          token,
          user: mockCurrentUser,
          permissions: mockPermissions.map(p => p.code),
          roles: ['admin'],
        };
      },
      'Token refresh unavailable'
    );
  }
}

export async function getCurrentUser(): Promise<AuthResult> {
  try {
    const result = await fetchJson<AuthResult>(`${API_BASE_URL}/users/me`, {
      headers: getAuthHeaders(),
    });
    if (result.token) setApiToken(result.token);
    return result;
  } catch (err) {
    console.warn('[AuthService] getCurrentUser failed:', err);
    const token = getApiToken();
    if (!token) {
      throw new Error('未登录');
    }
    return maybeMock(
      () => {
        const role = parseMockRoleFromToken(token);
        if (role) {
          const result = getMockLoginResult(role);
          return { ...result, token };
        }
        return {
          token,
          user: mockCurrentUser,
          permissions: mockPermissions.map(p => p.code),
          roles: ['admin'],
        };
      },
      'Current user endpoint unavailable'
    );
  }
}

export function logout(): void {
  setApiToken(null);
}

// ==================== Dev Mock Login ====================

export function parseMockRoleFromToken(token: string): MockRole | null {
  if (!token) return null;
  if (token.startsWith('mock-token-admin')) return 'admin';
  if (token.startsWith('mock-token-manager')) return 'manager';
  if (token.startsWith('mock-token-user')) return 'user';
  return null;
}

export type MockRole = 'admin' | 'manager' | 'user';

export function getMockLoginResult(role: MockRole): AuthResult {
  const baseUser: User = {
    id: `u-mock-${role}`,
    name: role === 'admin' ? '张经理' : role === 'manager' ? '王主管' : '李员工',
    username: role,
    employeeNo: `GL-${role.toUpperCase()}`,
    phone: '13800000000',
    email: `${role}@example.com`,
    departmentId: role === 'admin' ? 'd-001' : role === 'manager' ? 'd-003' : 'd-002',
    departmentName: role === 'admin' ? '数字化部' : role === 'manager' ? '人力资源部' : '财务部',
    roleIds: [role === 'admin' ? 'r-admin' : role === 'manager' ? 'r-manager' : 'r-user'],
    status: 'active',
  };

  const roleCodes: Record<MockRole, PermissionCode[]> = {
    admin: mockPermissions.map(p => p.code),
    manager: [
      'user:view',
      'org:view',
      'role:view',
      'agent:view',
      'agent:create',
      'knowledge:view',
      'knowledge:create',
      'app:view',
    ],
    user: [
      'agent:view',
      'knowledge:view',
      'app:view',
    ],
  };

  return {
    token: `mock-token-${role}-${Date.now()}`,
    user: baseUser,
    permissions: roleCodes[role],
    roles: [role],
  };
}

// ==================== User API ====================

export interface UserQueryParams {
  keyword?: string;
  departmentId?: string;
  roleId?: string;
  page?: number;
  limit?: number;
}

export interface PageResult<T> {
  list: T[];
  total: number;
}

export async function listUsers(params: UserQueryParams = {}): Promise<PageResult<User>> {
  try {
    const query = new URLSearchParams();
    if (params.keyword) query.set('keyword', params.keyword);
    if (params.departmentId) query.set('departmentId', params.departmentId);
    if (params.roleId) query.set('roleId', params.roleId);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    return await fetchJson<PageResult<User>>(`${API_BASE_URL}/users?${query.toString()}`, {
      headers: getAuthHeaders(),
    });
  } catch (err) {
    console.warn('[AuthService] listUsers failed:', err);
    return maybeMock(() => {
      let list = [...mockUsers];
      if (params.keyword) {
        const kw = params.keyword.toLowerCase();
        list = list.filter(
          u =>
            u.name.toLowerCase().includes(kw) ||
            (u.employeeNo && u.employeeNo.toLowerCase().includes(kw)) ||
            (u.username && u.username.toLowerCase().includes(kw))
        );
      }
      return { list, total: list.length };
    }, 'User list endpoint unavailable');
  }
}

export async function createUser(payload: Omit<User, 'id'>): Promise<User> {
  try {
    return await fetchJson<User>(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: getJsonAuthHeaders(),
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.warn('[AuthService] createUser failed:', err);
    return maybeMock(() => {
      const user: User = { ...payload, id: `u-${Date.now()}`, status: payload.status || 'active' };
      mockUsers.push(user);
      return user;
    }, 'Create user endpoint unavailable');
  }
}

export async function updateUser(id: string, payload: Partial<User>): Promise<User> {
  try {
    return await fetchJson<User>(`${API_BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: getJsonAuthHeaders(),
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.warn('[AuthService] updateUser failed:', err);
    return maybeMock(() => {
      const idx = mockUsers.findIndex(u => u.id === id);
      if (idx === -1) throw new Error('User not found');
      mockUsers[idx] = { ...mockUsers[idx], ...payload };
      return mockUsers[idx];
    }, 'Update user endpoint unavailable');
  }
}

export async function deleteUser(id: string): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
  } catch (err) {
    console.warn('[AuthService] deleteUser failed:', err);
    maybeMock(() => {
      const idx = mockUsers.findIndex(u => u.id === id);
      if (idx !== -1) mockUsers.splice(idx, 1);
    }, 'Delete user endpoint unavailable');
  }
}

// ==================== Department API ====================

export async function listDepartments(): Promise<Department[]> {
  try {
    return await fetchJson<Department[]>(`${API_BASE_URL}/departments`, {
      headers: getAuthHeaders(),
    });
  } catch (err) {
    console.warn('[AuthService] listDepartments failed:', err);
    return maybeMock(() => mockDepartments, 'Department list endpoint unavailable');
  }
}

export async function createDepartment(payload: Omit<Department, 'id'>): Promise<Department> {
  try {
    return await fetchJson<Department>(`${API_BASE_URL}/departments`, {
      method: 'POST',
      headers: getJsonAuthHeaders(),
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.warn('[AuthService] createDepartment failed:', err);
    return maybeMock(() => {
      const dept: Department = { ...payload, id: `d-${Date.now()}` };
      if (!dept.parentId) {
        mockDepartments.push(dept);
      } else {
        const parent = mockDepartments.find(d => d.id === dept.parentId);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(dept);
        } else {
          mockDepartments.push(dept);
        }
      }
      return dept;
    }, 'Create department endpoint unavailable');
  }
}

export async function updateDepartment(id: string, payload: Partial<Department>): Promise<Department> {
  try {
    return await fetchJson<Department>(`${API_BASE_URL}/departments/${id}`, {
      method: 'PUT',
      headers: getJsonAuthHeaders(),
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.warn('[AuthService] updateDepartment failed:', err);
    return maybeMock(() => {
      function findAndUpdate(list: Department[]): boolean {
        for (const d of list) {
          if (d.id === id) {
            Object.assign(d, payload);
            return true;
          }
          if (d.children && findAndUpdate(d.children)) return true;
        }
        return false;
      }
      if (!findAndUpdate(mockDepartments)) throw new Error('Department not found');
      return mockDepartments.find(d => d.id === id) as Department;
    }, 'Update department endpoint unavailable');
  }
}

export async function deleteDepartment(id: string): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/departments/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
  } catch (err) {
    console.warn('[AuthService] deleteDepartment failed:', err);
    maybeMock(() => {
      function findAndRemove(list: Department[]): boolean {
        const idx = list.findIndex(d => d.id === id);
        if (idx !== -1) {
          list.splice(idx, 1);
          return true;
        }
        for (const d of list) {
          if (d.children && findAndRemove(d.children)) return true;
        }
        return false;
      }
      findAndRemove(mockDepartments);
    }, 'Delete department endpoint unavailable');
  }
}

// ==================== Role API ====================

export async function listRoles(): Promise<Role[]> {
  try {
    return await fetchJson<Role[]>(`${API_BASE_URL}/roles`, {
      headers: getAuthHeaders(),
    });
  } catch (err) {
    console.warn('[AuthService] listRoles failed:', err);
    return maybeMock(() => mockRoles, 'Role list endpoint unavailable');
  }
}

export async function createRole(payload: Omit<Role, 'id'>): Promise<Role> {
  try {
    return await fetchJson<Role>(`${API_BASE_URL}/roles`, {
      method: 'POST',
      headers: getJsonAuthHeaders(),
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.warn('[AuthService] createRole failed:', err);
    return maybeMock(() => {
      const role: Role = { ...payload, id: `r-${Date.now()}` };
      mockRoles.push(role);
      return role;
    }, 'Create role endpoint unavailable');
  }
}

export async function updateRole(id: string, payload: Partial<Role>): Promise<Role> {
  try {
    return await fetchJson<Role>(`${API_BASE_URL}/roles/${id}`, {
      method: 'PUT',
      headers: getJsonAuthHeaders(),
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.warn('[AuthService] updateRole failed:', err);
    return maybeMock(() => {
      const idx = mockRoles.findIndex(r => r.id === id);
      if (idx === -1) throw new Error('Role not found');
      mockRoles[idx] = { ...mockRoles[idx], ...payload };
      return mockRoles[idx];
    }, 'Update role endpoint unavailable');
  }
}

export async function deleteRole(id: string): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/roles/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
  } catch (err) {
    console.warn('[AuthService] deleteRole failed:', err);
    maybeMock(() => {
      const idx = mockRoles.findIndex(r => r.id === id);
      if (idx !== -1) mockRoles.splice(idx, 1);
    }, 'Delete role endpoint unavailable');
  }
}

export async function listPermissions(): Promise<Permission[]> {
  try {
    return await fetchJson<Permission[]>(`${API_BASE_URL}/permissions`, {
      headers: getAuthHeaders(),
    });
  } catch (err) {
    console.warn('[AuthService] listPermissions failed:', err);
    return maybeMock(() => mockPermissions, 'Permission list endpoint unavailable');
  }
}

export { getApiToken, setApiToken };
