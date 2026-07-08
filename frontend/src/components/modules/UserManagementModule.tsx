import { useEffect, useState } from 'react';
import { Search, Plus, Edit2, Lock, Power, PowerOff, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { adminService } from '@/services/adminService';
import type { User, Organization, Role } from '@/types';

interface UserFormData {
  username: string;
  displayName: string;
  password?: string;
  email?: string;
  phone?: string;
  organizationId?: string;
  roleIds: string[];
}

export default function UserManagementModule() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [size] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState<UserFormData>({ username: '', displayName: '', password: '', email: '', phone: '', organizationId: '', roleIds: [] });

  const [pwdDialogOpen, setPwdDialogOpen] = useState(false);
  const [pwdForm, setPwdForm] = useState({ oldPassword: '', newPassword: '' });

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminService.users.list({ page, size, keyword });
      setUsers(res.records);
      setTotal(res.total);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '加载用户失败');
    } finally {
      setLoading(false);
    }
  };

  const loadMeta = async () => {
    try {
      const [o, r] = await Promise.all([adminService.organizations.list(), adminService.roles.list({ page: 1, size: 100 })]);
      setOrgs(o);
      setRoles(r.records);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    void load();
  }, [page, keyword]);

  useEffect(() => {
    void loadMeta();
  }, []);

  const openCreate = () => {
    setEditingUser(null);
    setForm({ username: '', displayName: '', password: '', email: '', phone: '', organizationId: '', roleIds: [] });
    setDialogOpen(true);
  };

  const openEdit = (user: User) => {
    setEditingUser(user);
    setForm({
      username: user.username,
      displayName: user.displayName,
      email: user.email || '',
      phone: user.phone || '',
      organizationId: user.organizationId || '',
      roleIds: [],
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingUser) {
        await adminService.users.update(editingUser.id, {
          displayName: form.displayName,
          email: form.email,
          phone: form.phone,
          organizationId: form.organizationId,
          roleIds: form.roleIds,
        });
        toast.success('用户已更新');
      } else {
        if (!form.password) {
          toast.error('请输入初始密码');
          return;
        }
        await adminService.users.create({
          username: form.username,
          displayName: form.displayName,
          password: form.password,
          email: form.email,
          phone: form.phone,
          organizationId: form.organizationId,
          roleIds: form.roleIds,
        });
        toast.success('用户已创建');
      }
      setDialogOpen(false);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '保存失败');
    }
  };

  const toggleStatus = async (user: User) => {
    try {
      if (user.status === 'ACTIVE') {
        await adminService.users.disable(user.id);
        toast.success('已禁用');
      } else {
        await adminService.users.enable(user.id);
        toast.success('已启用');
      }
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '操作失败');
    }
  };

  const totalPages = Math.ceil(total / size) || 1;

  return (
    <div className="flex-1 flex flex-col min-h-0 p-6 bg-[#F5F6F7]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-[#1F2329]">用户管理</h2>
        <Button onClick={openCreate} className="bg-[#3370FF] hover:bg-[#245BDB] text-white">
          <Plus className="w-4 h-4 mr-1" /> 新增用户
        </Button>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#BBBFC4]" />
          <Input
            placeholder="搜索用户名/显示名"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && setPage(1)}
            className="pl-9 rounded-xl bg-white border-[#DEE0E3]"
          />
        </div>
        <Button variant="outline" onClick={() => void load()} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} /> 刷新
        </Button>
      </div>

      <div className="flex-1 bg-white rounded-xl border border-[#DEE0E3] overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>用户名</TableHead>
              <TableHead>显示名</TableHead>
              <TableHead>部门</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.username}</TableCell>
                <TableCell>{u.displayName}</TableCell>
                <TableCell>{orgs.find((o) => o.id === u.organizationId)?.name || '-'}</TableCell>
                <TableCell>
                  <Badge variant={u.status === 'ACTIVE' ? 'default' : 'secondary'}>{u.status === 'ACTIVE' ? '启用' : '禁用'}</Badge>
                </TableCell>
                <TableCell>{u.createdAt ? format(new Date(u.createdAt), 'yyyy-MM-dd HH:mm') : '-'}</TableCell>
                <TableCell className="text-right space-x-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(u)} title="编辑">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => { setEditingUser(u); setPwdForm({ oldPassword: '', newPassword: '' }); setPwdDialogOpen(true); }} title="改密">
                    <Lock className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => void toggleStatus(u)} title={u.status === 'ACTIVE' ? '禁用' : '启用'}>
                    {u.status === 'ACTIVE' ? <PowerOff className="w-4 h-4 text-[#F54A45]" /> : <Power className="w-4 h-4 text-[#00B96B]" />}
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
          <DialogHeader>
            <DialogTitle className="text-[16px]">{editingUser ? '编辑用户' : '新增用户'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Input placeholder="用户名" value={form.username} disabled={!!editingUser} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} />
            <Input placeholder="显示名" value={form.displayName} onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))} />
            {!editingUser && (
              <Input type="password" placeholder="初始密码" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
            )}
            <Input placeholder="邮箱" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            <Input placeholder="手机号" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
            <select
              className="w-full h-9 rounded-md border border-[#DEE0E3] bg-white px-2 text-sm"
              value={form.organizationId}
              onChange={(e) => setForm((f) => ({ ...f, organizationId: e.target.value }))}
            >
              <option value="">选择部门</option>
              {orgs.map((o) => (<option key={o.id} value={o.id}>{o.name}</option>))}
            </select>
            <div className="border border-[#DEE0E3] rounded-md p-2 max-h-32 overflow-auto">
              <p className="text-xs text-[#8F959E] mb-1">分配角色</p>
              {roles.map((r) => (
                <label key={r.id} className="flex items-center gap-2 text-sm py-0.5">
                  <input
                    type="checkbox"
                    checked={form.roleIds.includes(r.id)}
                    onChange={(e) => {
                      setForm((f) => ({
                        ...f,
                        roleIds: e.target.checked ? [...f.roleIds, r.id] : f.roleIds.filter((id) => id !== r.id),
                      }));
                    }}
                  />
                  {r.name}
                </label>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>取消</Button>
            <Button className="bg-[#3370FF] hover:bg-[#245BDB] text-white" onClick={handleSave}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={pwdDialogOpen} onOpenChange={setPwdDialogOpen}>
        <DialogContent className="bg-white border-[#DEE0E3] max-w-sm">
          <DialogHeader><DialogTitle className="text-[16px]">修改密码</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <Input type="password" placeholder="旧密码" value={pwdForm.oldPassword} onChange={(e) => setPwdForm((f) => ({ ...f, oldPassword: e.target.value }))} />
            <Input type="password" placeholder="新密码" value={pwdForm.newPassword} onChange={(e) => setPwdForm((f) => ({ ...f, newPassword: e.target.value }))} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPwdDialogOpen(false)}>取消</Button>
            <Button className="bg-[#3370FF] hover:bg-[#245BDB] text-white" onClick={async () => {
              if (!editingUser) return;
              try {
                await adminService.users.changePassword(editingUser.id, pwdForm);
                toast.success('密码已修改');
                setPwdDialogOpen(false);
              } catch (err) {
                toast.error(err instanceof Error ? err.message : '修改失败');
              }
            }}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
