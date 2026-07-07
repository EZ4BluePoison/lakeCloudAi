import { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, Pencil, Trash2, Loader2, Shield } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { useAuthStore } from '@/store/authStore';
import * as authService from '@/services/authService';
import type { Role, Permission, PermissionCode } from '@/types';

interface RoleFormData {
  name: string;
  code: string;
  description: string;
  permissionCodes: PermissionCode[];
  status: 'active' | 'inactive';
}

const emptyForm: RoleFormData = {
  name: '',
  code: '',
  description: '',
  permissionCodes: [],
  status: 'active',
};

export function RoleManagementModule() {
  const { hasPermission } = useAuthStore();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [form, setForm] = useState<RoleFormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const canCreate = hasPermission('role:create');
  const canEdit = hasPermission('role:edit');
  const canDelete = hasPermission('role:delete');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [roleList, permList] = await Promise.all([
        authService.listRoles(),
        authService.listPermissions(),
      ]);
      setRoles(roleList);
      setPermissions(permList);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const groupedPermissions = useMemo(() => {
    const map = new Map<string, Permission[]>();
    for (const p of permissions) {
      if (!map.has(p.group)) map.set(p.group, []);
      map.get(p.group)!.push(p);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [permissions]);

  const openCreate = () => {
    setEditingRole(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (role: Role) => {
    setEditingRole(role);
    setForm({
      name: role.name,
      code: role.code,
      description: role.description || '',
      permissionCodes: [...role.permissionCodes],
      status: role.status === 'active' ? 'active' : 'inactive',
    });
    setDialogOpen(true);
  };

  const togglePermission = (code: PermissionCode) => {
    setForm((f) => {
      const exists = f.permissionCodes.includes(code);
      return {
        ...f,
        permissionCodes: exists
          ? f.permissionCodes.filter((c) => c !== code)
          : [...f.permissionCodes, code],
      };
    });
  };

  const toggleGroup = (codes: PermissionCode[]) => {
    setForm((f) => {
      const allSelected = codes.every((c) => f.permissionCodes.includes(c));
      if (allSelected) {
        return { ...f, permissionCodes: f.permissionCodes.filter((c) => !codes.includes(c)) };
      }
      const merged = new Set([...f.permissionCodes, ...codes]);
      return { ...f, permissionCodes: Array.from(merged) };
    });
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.code.trim()) return;
    setSubmitting(true);
    try {
      if (editingRole) {
        await authService.updateRole(editingRole.id, { ...form });
      } else {
        await authService.createRole({ ...form });
      }
      setDialogOpen(false);
      await loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (role: Role) => {
    if ((role.userCount || 0) > 0) {
      alert(`角色「${role.name}」已分配给用户，无法删除。`);
      return;
    }
    if (!confirm(`确定删除角色「${role.name}」吗？`)) return;
    await authService.deleteRole(role.id);
    await loadData();
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#F5F6F7]">
      <div className="h-[56px] flex items-center justify-between px-6 bg-white border-b border-[#DEE0E3]">
        <h2 className="text-[16px] font-semibold text-[#1F2329]">角色权限</h2>
        {canCreate && (
          <Button onClick={openCreate} className="bg-[#3370FF] hover:bg-[#245BDB] text-white">
            <Plus className="w-4 h-4" />
            新增角色
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="bg-white rounded-xl border border-[#DEE0E3] overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#F2F3F5]">
                <TableHead className="text-[#1F2329] font-medium">角色名称</TableHead>
                <TableHead className="text-[#1F2329] font-medium">角色编码</TableHead>
                <TableHead className="text-[#1F2329] font-medium">描述</TableHead>
                <TableHead className="text-[#1F2329] font-medium">权限数</TableHead>
                <TableHead className="text-[#1F2329] font-medium">已分配用户</TableHead>
                <TableHead className="text-[#1F2329] font-medium">状态</TableHead>
                <TableHead className="text-[#1F2329] font-medium text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto text-[#3370FF]" />
                  </TableCell>
                </TableRow>
              )}
              {!loading && roles.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-[#8F959E]">
                    暂无角色
                  </TableCell>
                </TableRow>
              )}
              {!loading && roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium text-[#1F2329] flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#3370FF]" />
                    {role.name}
                  </TableCell>
                  <TableCell className="text-[#646A73]">{role.code}</TableCell>
                  <TableCell className="text-[#646A73]">{role.description || '-'}</TableCell>
                  <TableCell className="text-[#646A73]">{role.permissionCodes.length}</TableCell>
                  <TableCell className="text-[#646A73]">{role.userCount || 0}</TableCell>
                  <TableCell>
                    <span className={role.status === 'active' ? 'text-[#00B96B]' : 'text-[#8F959E]'}>
                      {role.status === 'active' ? '启用' : '禁用'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {canEdit && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => openEdit(role)}
                          title="编辑"
                        >
                          <Pencil className="w-4 h-4 text-[#646A73]" />
                        </Button>
                      )}
                      {canDelete && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleDelete(role)}
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

      {/* Role Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-white border-[#DEE0E3] text-[#1F2329] max-w-2xl max-h-[85vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="text-[16px] font-semibold">
              {editingRole ? '编辑角色' : '新增角色'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[12px] text-[#646A73]">角色名称</label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="角色名称"
                  className="bg-[#F2F3F5] border-transparent focus:border-[#3370FF]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[12px] text-[#646A73]">角色编码</label>
                <Input
                  value={form.code}
                  onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                  placeholder="role-code"
                  className="bg-[#F2F3F5] border-transparent focus:border-[#3370FF]"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[12px] text-[#646A73]">描述</label>
              <Input
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="角色描述"
                className="bg-[#F2F3F5] border-transparent focus:border-[#3370FF]"
              />
            </div>
            <div className="flex items-center gap-3">
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

            <div className="space-y-1">
              <label className="text-[12px] text-[#646A73]">权限配置</label>
              <div className="border border-[#DEE0E3] rounded-lg p-4 space-y-4 bg-[#FAFBFC]">
                {groupedPermissions.map(([group, items]) => {
                  const groupCodes = items.map((p) => p.code);
                  const groupSelectedCount = groupCodes.filter((c) =>
                    form.permissionCodes.includes(c)
                  ).length;
                  const allSelected = groupSelectedCount === groupCodes.length && groupCodes.length > 0;
                  return (
                    <div key={group}>
                      <div className="flex items-center gap-2 mb-2">
                        <Checkbox
                          checked={allSelected}
                          onCheckedChange={() => toggleGroup(groupCodes)}
                        />
                        <span className="text-[13px] font-medium text-[#1F2329]">{group}</span>
                        <span className="text-[11px] text-[#8F959E]">
                          {groupSelectedCount}/{groupCodes.length}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pl-6">
                        {items.map((p) => (
                          <label
                            key={p.code}
                            className="flex items-center gap-2 text-[13px] text-[#646A73] cursor-pointer hover:text-[#1F2329]"
                          >
                            <Checkbox
                              checked={form.permissionCodes.includes(p.code)}
                              onCheckedChange={() => togglePermission(p.code)}
                            />
                            {p.name}
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-[#DEE0E3]">
              取消
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting || !form.name.trim() || !form.code.trim()}
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
