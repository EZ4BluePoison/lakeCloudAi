import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { adminService } from '@/services/adminService';
import type { Organization } from '@/types';

interface OrgFormData {
  code?: string;
  name: string;
  parentId?: string;
  sortOrder?: number;
}

function flatten(orgs: Organization[]): Organization[] {
  const result: Organization[] = [];
  const walk = (list: Organization[], depth = 0) => {
    list.forEach((o) => {
      result.push({ ...o, name: `${'　'.repeat(depth)}${o.name}` });
      if (o.children?.length) walk(o.children, depth + 1);
    });
  };
  walk(orgs);
  return result;
}

export default function OrgManagementModule() {
  const [tree, setTree] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [form, setForm] = useState<OrgFormData>({ name: '', code: '', parentId: '', sortOrder: 0 });

  const load = async () => {
    setLoading(true);
    try {
      const data = await adminService.organizations.tree();
      setTree(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '加载组织架构失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const openCreate = (parentId?: string) => {
    setEditingOrg(null);
    setForm({ name: '', code: '', parentId: parentId || '', sortOrder: 0 });
    setDialogOpen(true);
  };

  const openEdit = (org: Organization) => {
    setEditingOrg(org);
    setForm({ name: org.name, code: org.code, parentId: org.parentId || '', sortOrder: org.sortOrder });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingOrg) {
        await adminService.organizations.update(editingOrg.id, { name: form.name, code: form.code, parentId: form.parentId, sortOrder: form.sortOrder });
        toast.success('部门已更新');
      } else {
        await adminService.organizations.create({ name: form.name, code: form.code, parentId: form.parentId, sortOrder: form.sortOrder });
        toast.success('部门已创建');
      }
      setDialogOpen(false);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '保存失败');
    }
  };

  const handleDelete = async (org: Organization) => {
    if (!confirm(`确定删除部门「${org.name}」吗？`)) return;
    try {
      await adminService.organizations.delete(org.id);
      toast.success('已删除');
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '删除失败');
    }
  };

  const flat = flatten(tree);

  return (
    <div className="flex-1 flex flex-col min-h-0 p-6 bg-[#F5F6F7]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-[#1F2329]">组织架构</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => void load()} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} /> 刷新
          </Button>
          <Button onClick={() => openCreate()} className="bg-[#3370FF] hover:bg-[#245BDB] text-white">
            <Plus className="w-4 h-4 mr-1" /> 新增部门
          </Button>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-xl border border-[#DEE0E3] overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>部门名称</TableHead>
              <TableHead>编码</TableHead>
              <TableHead>排序</TableHead>
              <TableHead>状态</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {flat.map((o) => (
              <TableRow key={o.id}>
                <TableCell className="font-medium">{o.name}</TableCell>
                <TableCell>{o.code || '-'}</TableCell>
                <TableCell>{o.sortOrder ?? '-'}</TableCell>
                <TableCell>{o.status === 'ACTIVE' ? '启用' : '禁用'}</TableCell>
                <TableCell className="text-right space-x-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(o)} title="编辑"><Edit2 className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => openCreate(o.id)} title="新增子部门"><Plus className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => void handleDelete(o)} title="删除"><Trash2 className="w-4 h-4 text-[#F54A45]" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-white border-[#DEE0E3] max-w-md">
          <DialogHeader><DialogTitle className="text-[16px]">{editingOrg ? '编辑部门' : '新增部门'}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <Input placeholder="部门名称" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            <Input placeholder="编码" value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} />
            <select
              className="w-full h-9 rounded-md border border-[#DEE0E3] bg-white px-2 text-sm"
              value={form.parentId}
              onChange={(e) => setForm((f) => ({ ...f, parentId: e.target.value }))}
            >
              <option value="">无上级</option>
              {flat.map((o) => (
                <option key={o.id} value={o.id}>{o.name.trim()}</option>
              ))}
            </select>
            <Input type="number" placeholder="排序" value={form.sortOrder} onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))} />
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
