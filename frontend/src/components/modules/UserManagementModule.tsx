import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuthStore } from '@/store/authStore';
import * as authService from '@/services/authService';
import type { User, Role } from '@/types';

interface UserFormData {
  name: string;
  username: string;
  employeeNo: string;
  phone: string;
  email: string;
  departmentId: string;
  departmentName: string;
  roleIds: string[];
  status: 'active' | 'inactive';
}

const emptyForm: UserFormData = {
  name: '',
  username: '',
  employeeNo: '',
  phone: '',
  email: '',
  departmentId: '',
  departmentName: '',
  roleIds: [],
  status: 'active',
};

export function UserManagementModule() {
  const { hasPermission } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState<UserFormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const result = await authService.listUsers({ keyword: debouncedKeyword, limit: 100 });
      setUsers(result.list);
    } finally {
      setLoading(false);
    }
  }, [debouncedKeyword]);

  const loadRoles = useCallback(async () => {
    try {
      const list = await authService.listRoles();
      setRoles(list);
    } catch {
      setRoles([]);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedKeyword(keyword.trim()), 300);
    return () => clearTimeout(timer);
  }, [keyword]);

  const openCreate = () => {
    setEditingUser(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (user: User) => {
    setEditingUser(user);
    setForm({
      name: user.name,
      username: user.username || '',
      employeeNo: user.employeeNo || '',
      phone: user.phone || '',
      email: user.email || '',
      departmentId: user.departmentId || '',
      departmentName: user.departmentName || '',
      roleIds: user.roleIds || [],
      status: user.status === 'active' ? 'active' : 'inactive',
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) return;
    setSubmitting(true);
    try {
      if (editingUser) {
        await authService.updateUser(editingUser.id, { ...form });
      } else {
        await authService.createUser({ ...form });
      }
      setDialogOpen(false);
      await loadUsers();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除该用户吗？')) return;
    await authService.deleteUser(id);
    await loadUsers();
  };

  const handleToggleStatus = async (user: User) => {
    const next = user.status === 'active' ? 'inactive' : 'active';
    await authService.updateUser(user.id, { status: next });
    await loadUsers();
  };

  const canCreate = hasPermission('user:create');
  const canEdit = hasPermission('user:edit');
  const canDelete = hasPermission('user:delete');

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#F5F6F7]">
      {/* Header */}
      <div className="h-[56px] flex items-center justify-between px-6 bg-white border-b border-[#DEE0E3]">
        <h2 className="text-[16px] font-semibold text-[#1F2329]">用户管理</h2>
        {canCreate && (
          <Button onClick={openCreate} className="bg-[#3370FF] hover:bg-[#245BDB] text-white">
            <Plus className="w-4 h-4" />
            新增用户
          </Button>
        )}
      </div>

      {/* Toolbar */}
      <div className="px-6 py-4">
        <div className="relative w-[280px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#BBBFC4]" />
          <Input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜索姓名 / 工号"
            className="pl-9 bg-white border-[#DEE0E3] text-[#1F2329] placeholder:text-[#BBBFC4]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto px-6 pb-6">
        <div className="bg-white rounded-xl border border-[#DEE0E3] overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#F2F3F5]">
                <TableHead className="text-[#1F2329] font-medium">姓名</TableHead>
                <TableHead className="text-[#1F2329] font-medium">工号</TableHead>
                <TableHead className="text-[#1F2329] font-medium">部门</TableHead>
                <TableHead className="text-[#1F2329] font-medium">角色</TableHead>
                <TableHead className="text-[#1F2329] font-medium">状态</TableHead>
                <TableHead className="text-[#1F2329] font-medium text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto text-[#3370FF]" />
                  </TableCell>
                </TableRow>
              )}
              {!loading && users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-[#8F959E]">
                    暂无用户
                  </TableCell>
                </TableRow>
              )}
              {!loading && users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium text-[#1F2329]">{user.name}</TableCell>
                  <TableCell className="text-[#646A73]">{user.employeeNo || '-'}</TableCell>
                  <TableCell className="text-[#646A73]">{user.departmentName || '-'}</TableCell>
                  <TableCell className="text-[#646A73]">
                    {user.roleIds
                      ?.map((id) => roles.find((r) => r.id === id)?.name || id)
                      .join(', ') || '-'}
                  </TableCell>
                  <TableCell>
                    {canEdit ? (
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={user.status === 'active'}
                          onCheckedChange={() => handleToggleStatus(user)}
                        />
                        <span className={user.status === 'active' ? 'text-[#00B96B]' : 'text-[#8F959E]'}>
                          {user.status === 'active' ? '启用' : '禁用'}
                        </span>
                      </div>
                    ) : (
                      <span className={user.status === 'active' ? 'text-[#00B96B]' : 'text-[#8F959E]'}>
                        {user.status === 'active' ? '启用' : '禁用'}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {canEdit && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => openEdit(user)}
                          title="编辑"
                        >
                          <Pencil className="w-4 h-4 text-[#646A73]" />
                        </Button>
                      )}
                      {canDelete && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleDelete(user.id)}
                          title="删除"
                        >
                          <Trash2 className="w-4 h-4 text-[#F54A45]" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-white border-[#DEE0E3] text-[#1F2329] max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[16px] font-semibold">
              {editingUser ? '编辑用户' : '新增用户'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="space-y-1">
              <label className="text-[12px] text-[#646A73]">姓名</label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="姓名"
                className="bg-[#F2F3F5] border-transparent focus:border-[#3370FF]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[12px] text-[#646A73]">用户名</label>
              <Input
                value={form.username}
                onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                placeholder="用户名"
                className="bg-[#F2F3F5] border-transparent focus:border-[#3370FF]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[12px] text-[#646A73]">工号</label>
              <Input
                value={form.employeeNo}
                onChange={(e) => setForm((f) => ({ ...f, employeeNo: e.target.value }))}
                placeholder="工号"
                className="bg-[#F2F3F5] border-transparent focus:border-[#3370FF]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[12px] text-[#646A73]">手机号</label>
              <Input
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="手机号"
                className="bg-[#F2F3F5] border-transparent focus:border-[#3370FF]"
              />
            </div>
            <div className="col-span-2 space-y-1">
              <label className="text-[12px] text-[#646A73]">邮箱</label>
              <Input
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="邮箱"
                className="bg-[#F2F3F5] border-transparent focus:border-[#3370FF]"
              />
            </div>
            <div className="col-span-2 space-y-1">
              <label className="text-[12px] text-[#646A73]">所属部门</label>
              <Input
                value={form.departmentName}
                onChange={(e) => setForm((f) => ({ ...f, departmentName: e.target.value }))}
                placeholder="部门名称"
                className="bg-[#F2F3F5] border-transparent focus:border-[#3370FF]"
              />
            </div>
            <div className="col-span-2 space-y-1">
              <label className="text-[12px] text-[#646A73]">角色</label>
              <Select
                value={form.roleIds[0] || ''}
                onValueChange={(value) => setForm((f) => ({ ...f, roleIds: value ? [value] : [] }))}
              >
                <SelectTrigger className="bg-[#F2F3F5] border-transparent focus:border-[#3370FF]">
                  <SelectValue placeholder="选择角色" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 flex items-center gap-3">
              <Switch
                checked={form.status === 'active'}
                onCheckedChange={(checked) =>
                  setForm((f) => ({ ...f, status: checked ? 'active' : 'inactive' }))
                }
              />
              <span className="text-[13px] text-[#1F2329]">
                {form.status === 'active' ? '启用' : '禁用'}
              </span>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-[#DEE0E3]">
              取消
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting || !form.name.trim()}
              className="bg-[#3370FF] hover:bg-[#245BDB] text-white"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : '保存'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
