import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { adminService } from '@/services/adminService';
import type { Permission } from '@/types';

interface PermissionFormData {
  code: string;
  name: string;
  description?: string;
  category: string;
}

export default function PermissionManagementModule() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [size] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPerm, setEditingPerm] = useState<Permission | null>(null);
  const [form, setForm] = useState<PermissionFormData>({ code: '', name: '', description: '', category: '' });

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminService.permissions.listPaged({ page, size, keyword, category });
      setPermissions(res.records);
      setTotal(res.total);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '加载权限失败');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const groups = await adminService.permissions.listGrouped();
      setCategories(groups.map((g) => g.category));
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    void load();
  }, [page, keyword, category]);

  useEffect(() => {
    void loadCategories();
  }, []);

  const openCreate = () => {
    setEditingPerm(null);
    setForm({ code: '', name: '', description: '', category: category || '' });
    setDialogOpen(true);
  };

  const openEdit = (perm: Permission) => {
    setEditingPerm(perm);
    setForm({ code: perm.code, name: perm.name, description: perm.description || '', category: perm.category });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingPerm) {
        await adminService.permissions.update(editingPerm.id, form);
        toast.success('权限已更新');
      } else {
        await adminService.permissions.create(form);
        toast.success('权限已创建');
      }
      setDialogOpen(false);
      await load();
      await loadCategories();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '保存失败');
    }
  };

  const handleDelete = async (perm: Permission) => {
    if (!confirm(`确定删除权限「${perm.name}」吗？`)) return;
    try {
      await adminService.permissions.delete(perm.id);
      toast.success('已删除');
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '删除失败');
    }
  };

  const totalPages = Math.ceil(total / size) || 1;

  return (
    <div className="flex-1 flex flex-col min-h-0 p-6 bg-[#F5F6F7]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-[#1F2329]">权限管理</h2>
        <Button onClick={openCreate} className="bg-[#3370FF] hover:bg-[#245BDB] text-white">
          <Plus className="w-4 h-4 mr-1" /> 新增权限
        </Button>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <Input
          placeholder="搜索权限名称/编码"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && setPage(1)}
          className="max-w-sm rounded-xl bg-white border-[#DEE0E3]"
        />
        <select
          className="h-9 rounded-md border border-[#DEE0E3] bg-white px-2 text-sm"
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1); }}
        >
          <option value="">全部分类</option>
          {categories.map((c) => (<option key={c} value={c}>{c}</option>))}
        </select>
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
              <TableHead>分类</TableHead>
              <TableHead>类型</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {permissions.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.code}</TableCell>
                <TableCell>{p.name}</TableCell>
                <TableCell>{p.category}</TableCell>
                <TableCell><Badge variant={p.isSystem ? 'secondary' : 'outline'}>{p.isSystem ? '系统' : '租户'}</Badge></TableCell>
                <TableCell>{p.createdAt ? format(new Date(p.createdAt), 'yyyy-MM-dd HH:mm') : '-'}</TableCell>
                <TableCell className="text-right space-x-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(p)} title="编辑"><Edit2 className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => void handleDelete(p)} title="删除"><Trash2 className="w-4 h-4 text-[#F54A45]" /></Button>
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
          <DialogHeader><DialogTitle className="text-[16px]">{editingPerm ? '编辑权限' : '新增权限'}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <Input placeholder="权限编码" value={form.code} disabled={!!editingPerm} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} />
            <Input placeholder="权限名称" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            <Input placeholder="描述" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            <Input placeholder="分类" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} list="perm-categories" />
            <datalist id="perm-categories">
              {categories.map((c) => (<option key={c} value={c} />))}
            </datalist>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>取消</Button>
            <Button className="bg-[#3370FF] hover:bg-[#245BDB] text-white" onClick={handleSave}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
