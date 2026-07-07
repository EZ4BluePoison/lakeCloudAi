import { useState, useEffect, useCallback } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  Plus,
  Pencil,
  Trash2,
  Users,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useAuthStore } from '@/store/authStore';
import * as authService from '@/services/authService';
import type { Department, User } from '@/types';

interface TreeNodeProps {
  dept: Department;
  level: number;
  selectedId?: string;
  expanded: Set<string>;
  onSelect: (dept: Department) => void;
  onToggle: (id: string) => void;
  canEdit: boolean;
  canDelete: boolean;
  onEdit: (dept: Department) => void;
  onDelete: (dept: Department) => void;
  onAddChild: (parentId: string) => void;
}

function DepartmentTreeNode({
  dept,
  level,
  selectedId,
  expanded,
  onSelect,
  onToggle,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
  onAddChild,
}: TreeNodeProps) {
  const hasChildren = (dept.children?.length || 0) > 0;
  const isExpanded = expanded.has(dept.id);
  const isSelected = selectedId === dept.id;

  return (
    <div>
      <div
        className={`
          flex items-center gap-1 rounded-md cursor-pointer select-none
          ${isSelected ? 'bg-[#E8F1FF] text-[#3370FF]' : 'hover:bg-[#EBEBEB] text-[#1F2329]'}
        `}
        style={{ paddingLeft: `${level * 16 + 4}px` }}
        onClick={() => onSelect(dept)}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (hasChildren) onToggle(dept.id);
          }}
          className="w-5 h-5 flex items-center justify-center text-[#8F959E]"
        >
          {hasChildren ? (
            isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />
          ) : (
            <span className="w-3.5" />
          )}
        </button>
        {isExpanded ? (
          <FolderOpen className="w-4 h-4 text-[#3370FF] flex-shrink-0" />
        ) : (
          <Folder className="w-4 h-4 text-[#8F959E] flex-shrink-0" />
        )}
        <span className="flex-1 truncate text-[13px] py-1.5">{dept.name}</span>
        {canEdit && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddChild(dept.id);
            }}
            className="w-6 h-6 flex items-center justify-center rounded text-[#8F959E] hover:text-[#3370FF] hover:bg-[#D0E0FF] opacity-0 group-hover:opacity-100 transition-opacity"
            title="新增子部门"
          >
            <Plus className="w-3 h-3" />
          </button>
        )}
        {canEdit && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(dept);
            }}
            className="w-6 h-6 flex items-center justify-center rounded text-[#8F959E] hover:text-[#3370FF] hover:bg-[#D0E0FF]"
            title="重命名"
          >
            <Pencil className="w-3 h-3" />
          </button>
        )}
        {canDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(dept);
            }}
            className="w-6 h-6 flex items-center justify-center rounded text-[#8F959E] hover:text-[#F54A45] hover:bg-[#FFF2F0] mr-1"
            title="删除"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        )}
      </div>
      {hasChildren && isExpanded && (
        <div>
          {dept.children!.map((child) => (
            <DepartmentTreeNode
              key={child.id}
              dept={child}
              level={level + 1}
              selectedId={selectedId}
              expanded={expanded}
              onSelect={onSelect}
              onToggle={onToggle}
              canEdit={canEdit}
              canDelete={canDelete}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function OrgManagementModule() {
  const { hasPermission } = useAuthStore();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [parentId, setParentId] = useState<string | undefined>();
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [deptName, setDeptName] = useState('');

  const canEdit = hasPermission('org:edit');
  const canDelete = hasPermission('org:delete');
  const canCreate = hasPermission('org:create');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [deptList, userResult] = await Promise.all([
        authService.listDepartments(),
        authService.listUsers({ limit: 1000 }),
      ]);
      setDepartments(deptList);
      setUsers(userResult.list);
      if (!selectedDept && deptList.length > 0) {
        setSelectedDept(deptList[0]);
      }
    } finally {
      setLoading(false);
    }
  }, [selectedDept]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAddRoot = () => {
    setDialogMode('create');
    setParentId(undefined);
    setDeptName('');
    setDialogOpen(true);
  };

  const handleAddChild = (parentId: string) => {
    setDialogMode('create');
    setParentId(parentId);
    setDeptName('');
    setDialogOpen(true);
  };

  const handleEdit = (dept: Department) => {
    setDialogMode('edit');
    setEditingDept(dept);
    setDeptName(dept.name);
    setDialogOpen(true);
  };

  const handleDelete = async (dept: Department) => {
    if (!confirm(`确定删除部门「${dept.name}」吗？`)) return;
    await authService.deleteDepartment(dept.id);
    if (selectedDept?.id === dept.id) setSelectedDept(null);
    await loadData();
  };

  const handleDialogSubmit = async () => {
    if (!deptName.trim()) return;
    if (dialogMode === 'create') {
      await authService.createDepartment({
        name: deptName.trim(),
        parentId,
        level: parentId ? 2 : 1,
      });
    } else if (editingDept) {
      await authService.updateDepartment(editingDept.id, { name: deptName.trim() });
    }
    setDialogOpen(false);
    await loadData();
  };

  const members = selectedDept
    ? users.filter(
        (u) =>
          u.departmentId === selectedDept.id ||
          u.departmentName === selectedDept.name
      )
    : [];

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#F5F6F7]">
      <div className="h-[56px] flex items-center justify-between px-6 bg-white border-b border-[#DEE0E3]">
        <h2 className="text-[16px] font-semibold text-[#1F2329]">组织架构</h2>
        {canCreate && (
          <Button onClick={handleAddRoot} className="bg-[#3370FF] hover:bg-[#245BDB] text-white">
            <Plus className="w-4 h-4" />
            新增部门
          </Button>
        )}
      </div>

      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left: Department Tree */}
        <div className="w-[320px] flex flex-col bg-white border-r border-[#DEE0E3]">
          <div className="px-4 py-3 border-b border-[#DEE0E3] text-[13px] font-medium text-[#1F2329]">
            部门列表
          </div>
          <div className="flex-1 overflow-auto p-2 group">
            {loading && departments.length === 0 && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-[#3370FF]" />
              </div>
            )}
            {departments.map((dept) => (
              <DepartmentTreeNode
                key={dept.id}
                dept={dept}
                level={0}
                selectedId={selectedDept?.id}
                expanded={expanded}
                onSelect={setSelectedDept}
                onToggle={toggleExpand}
                canEdit={canEdit}
                canDelete={canDelete}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onAddChild={handleAddChild}
              />
            ))}
          </div>
        </div>

        {/* Right: Members */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="px-6 py-4 border-b border-[#DEE0E3] bg-white flex items-center gap-2">
            <Users className="w-4 h-4 text-[#3370FF]" />
            <span className="text-[15px] font-medium text-[#1F2329]">
              {selectedDept ? `${selectedDept.name} 成员` : '请选择部门'}
            </span>
            <span className="text-[12px] text-[#8F959E]">({members.length})</span>
          </div>
          <div className="flex-1 overflow-auto p-6">
            {selectedDept ? (
              <div className="bg-white rounded-xl border border-[#DEE0E3] overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#F2F3F5]">
                      <TableHead className="text-[#1F2329] font-medium">姓名</TableHead>
                      <TableHead className="text-[#1F2329] font-medium">工号</TableHead>
                      <TableHead className="text-[#1F2329] font-medium">邮箱</TableHead>
                      <TableHead className="text-[#1F2329] font-medium">状态</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-[#8F959E]">
                          该部门暂无成员
                        </TableCell>
                      </TableRow>
                    )}
                    {members.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium text-[#1F2329]">{user.name}</TableCell>
                        <TableCell className="text-[#646A73]">{user.employeeNo || '-'}</TableCell>
                        <TableCell className="text-[#646A73]">{user.email || '-'}</TableCell>
                        <TableCell>
                          <span className={user.status === 'active' ? 'text-[#00B96B]' : 'text-[#8F959E]'}>
                            {user.status === 'active' ? '启用' : '禁用'}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-[#8F959E]">
                在左侧选择部门查看成员
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dept Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-white border-[#DEE0E3] text-[#1F2329] max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-[16px] font-semibold">
              {dialogMode === 'create' ? '新增部门' : '重命名部门'}
            </DialogTitle>
          </DialogHeader>
          <Input
            value={deptName}
            onChange={(e) => setDeptName(e.target.value)}
            placeholder="部门名称"
            className="bg-[#F2F3F5] border-transparent focus:border-[#3370FF]"
            onKeyDown={(e) => e.key === 'Enter' && handleDialogSubmit()}
          />
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-[#DEE0E3]">
              取消
            </Button>
            <Button
              onClick={handleDialogSubmit}
              disabled={!deptName.trim()}
              className="bg-[#3370FF] hover:bg-[#245BDB] text-white"
            >
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
