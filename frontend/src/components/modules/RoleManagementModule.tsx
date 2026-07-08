import { useEffect, useState } from 'react';
import { Plus, Edit2, Power, PowerOff, RefreshCw, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { adminService } from '@/services/adminService';
import type { Role, PermissionCategoryGroup } from '@/types';

interface RoleFormData {
  code: string;
  name: string;
  description?: string;
  scope: 'PLATFORM' | 'TENANT';
}

export default function RoleManagementModule() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [size] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [form, setForm] = useState<RoleFormData>({ code: '', name: '', description: '', scope: 'TENANT' });

  const [permGroups, setPermGroups] = useState<PermissionCategoryGroup[]>([]);
  const [permDialogOpen, setPermDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedPermIds, setSelectedPermIds] = useState<string[]>([]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminService.roles.list({ page, size, keyword });
      setRoles(res.records);
      setTotal(res.total);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '加载角色失败');
    } finally {
      setLoading(false);
    }
  };

  const loadPermissions = async () => {
    try {
      const data = await adminService.permissions.listGrouped();
      setPermGroups(data);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    void load();
  }, [page, keyword]);

  useEffect(() => {
    void loadPermissions();
  }, []);

  const openCreate = () => {
    setEditingRole(null);
    setForm({ code: '', name: '', description: '', scope: 'TENANT' });
    setDialogOpen(true);
  };

  const openEdit = (role: Role) => {
    setEditingRole(role);
    setForm({ code: role.code, name: role.name, description: role.description || '', scope: role.scope });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingRole) {
        await adminService.roles.update(editingRole.id, { code: form.code, name: form.name, description: form.description });
        toast.success('角色已更新');
      } else {
        await adminService.roles.create({ code: form.code, name: form.name, description: form.description, scope: form.scope });
        toast.success('角色已创建');
      }
      setDialogOpen(false);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '保存失败');
    }
  };

  const toggleStatus = async (role: Role) => {
    try {
      if (role.status === 'ACTIVE') {
        await adminService.roles.disable(role.id);
        toast.success('已禁用');
      } else {
        await adminService.roles.enable(role.id);
        toast.success('已启用');
      }
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '操作失败');
    }
  };

  const openAssignPermissions = (role: Role) => {
    setSelectedRole(role);
    setSelectedPermIds([]);
    setPermDialogOpen(true);
  };

  const handleAssignPermissions = async () => {
    if (!selectedRole) return;
    try {
      await adminService.roles.assignPermissions(selectedRole.id, selectedPermIds);
      toast.success('权限已分配');
      setPermDialogOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '分配失败');
    }
  };

  const totalPages = Math.ceil(total / size) || 1;

  return (
    <div className="flex-1 flex flex-col min-h-0 p-6 bg-[#F5F6F7]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-[#1F2329]">角色权限</h2>
        <Button onClick={openCreate} className="bg-[#3370FF] hover:bg-[#245BDB] text-white">
          <Plus className="w-4 h-4 mr-1" /> 新增角色
        </Button>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <Input
          placeholder="搜索角色名称/编码"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && setPage(1)}
          className="max-w-sm rounded-xl bg-white border-[#DEE0E3]"
        />
        <Button variant="outline" onClick={() => void load()} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} /> 刷新
        </Button>
      </div>

      <div className="flex-1 bg-white rounded-xl border border-[#DEE0E3] overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>编码</TableHead>
              <TableHead>名称</TableHead>
              <TableHead>范围</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.code}</TableCell>
                <TableCell>{r.name}</TableCell>
                <TableCell><Badge variant="secondary">{r.scope}</Badge></TableCell>
                <TableCell>
                  <Badge variant={r.status === 'ACTIVE' ? 'default' : 'secondary'}>{r.status === 'ACTIVE' ? '启用' : '禁用'}</Badge>
                </TableCell>
                <TableCell>{r.createdAt ? format(new Date(r.createdAt), 'yyyy-MM-dd HH:mm') : '-'}</TableCell>
                <TableCell className="text-right space-x-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(r)} title="编辑"><Edit2 className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => openAssignPermissions(r)} title="分配权限"><ShieldCheck className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => void toggleStatus(r)} title={r.status === 'ACTIVE' ? '禁用' : '启用'}>
                    {r.status === 'ACTIVE' ? <PowerOff className="w-4 h-4 text-[#F54A45]" /> : <Power className="w-4 h-4 text-[#00B96B]" />}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end gap-2 mt-4">
        <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>上一页</Button>
        <span className="text-sm text-[#646A73]">{page} / {totalPages}</span>
        <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>下一页</Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-white border-[#DEE0E3] max-w-md">
          <DialogHeader><DialogTitle className="text-[16px]">{editingRole ? '编辑角色' : '新增角色'}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <Input placeholder="角色编码" value={form.code} disabled={!!editingRole} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} />
            <Input placeholder="角色名称" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            <Input placeholder="描述" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            {!editingRole && (
              <select
                className="w-full h-9 rounded-md border border-[#DEE0E3] bg-white px-2 text-sm"
                value={form.scope}
                onChange={(e) => setForm((f) => ({ ...f, scope: e.target.value as 'PLATFORM' | 'TENANT' }))}
              >
                <option value="TENANT">租户</option>
                <option value="PLATFORM">平台</option>
              </select>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>取消</Button>
            <Button className="bg-[#3370FF] hover:bg-[#245BDB] text-white" onClick={handleSave}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={permDialogOpen} onOpenChange={setPermDialogOpen}>
        <DialogContent className="bg-white border-[#DEE0E3] max-w-lg">
          <DialogHeader><DialogTitle className="text-[16px]">分配权限：{selectedRole?.name}</DialogTitle></DialogHeader>
          <div className="max-h-[60vh] overflow-auto space-y-4 py-2">
            {permGroups.map((g) => (
              <div key={g.category}>
                <h4 className="text-sm font-semibold text-[#1F2329] mb-2">{g.category}</h4>
                <div className="grid grid-cols-2 gap-2">
                  {g.permissions.map((p) => (
                    <label key={p.id} className="flex items-center gap-2 text-sm p-2 rounded-md border border-[#EBEBEB] hover:bg-[#F2F3F5]">
                      <input
                        type="checkbox"
                        checked={selectedPermIds.includes(p.id)}
                        onChange={(e) => setSelectedPermIds((prev) => e.target.checked ? [...prev, p.id] : prev.filter((id) => id !== p.id))}
                      />
                      <span>{p.name}</span>
                      <span className="text-[10px] text-[#8F959E]">({p.code})</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPermDialogOpen(false)}>取消</Button>
            <Button className="bg-[#3370FF] hover:bg-[#245BDB] text-white" onClick={handleAssignPermissions}>确认分配</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
