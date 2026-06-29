import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Folder, FileText, ChevronRight, ChevronDown, Plus, Trash2, BookOpen, Upload, X,
  Settings2, Pencil, Search, MoreHorizontal, Beaker
} from 'lucide-react';
import type { FileNode } from '@/types';
import { knowledgeBaseData as initialData, knowledgeOrgTree } from '@/data/agents';
import { bffService } from '@/services/bffService';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface OrgNode { id: string; name: string; level: number; children?: OrgNode[]; }

/** Resolve a dept id to its full four-level path */
function resolvePath(deptId: string) {
  function walk(node: OrgNode, parentNames: string[]): { group: string; subGroup: string; company: string; department: string } | null {
    const currentNames = [...parentNames, node.name];
    if (node.level === 4 && node.id === deptId && currentNames.length === 4) {
      return { group: currentNames[0], subGroup: currentNames[1], company: currentNames[2], department: currentNames[3] };
    }
    if (node.children) {
      for (const child of node.children) { const r = walk(child, currentNames); if (r) return r; }
    }
    return null;
  }
  for (const root of knowledgeOrgTree as OrgNode[]) { const r = walk(root, []); if (r) return r; }
  return null;
}

// ===== Admin Dialogs =====

function AddFolderDialog({ open, onClose, onConfirm }: { open: boolean; onClose: () => void; onConfirm: (name: string) => void }) {
  const [name, setName] = useState('');
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-white border-[#DEE0E3] text-[#1F2329] max-w-sm">
        <DialogHeader><DialogTitle className="text-[15px] font-semibold">新建文件夹</DialogTitle></DialogHeader>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="文件夹名称"
          className="w-full px-3 py-2 rounded-lg bg-[#F2F3F5] border border-transparent focus:border-[#3370FF] text-[13px] outline-none placeholder:text-[#BBBFC4]" />
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} className="text-[13px] border-[#DEE0E3] text-[#646A73]">取消</Button>
          <Button onClick={() => { if (name.trim()) onConfirm(name.trim()); setName(''); }}
            className="text-[13px] bg-[#3370FF] text-white hover:bg-[#245BDB]">确定</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function UploadFileDialog({ open, onClose, onConfirm }: { open: boolean; onClose: () => void; onConfirm: (name: string, content: string) => void }) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isReading, setIsReading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  const handleUpload = () => {
    if (!selectedFile) return;
    setIsReading(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = typeof ev.target?.result === 'string' ? ev.target.result : '[Binary file content]';
      onConfirm(selectedFile.name, content);
      setSelectedFile(null);
      setIsReading(false);
      if (inputRef.current) inputRef.current.value = '';
    };
    reader.onerror = () => {
      setIsReading(false);
      onConfirm(selectedFile.name, '[File read error]');
      setSelectedFile(null);
    };
    reader.readAsText(selectedFile);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { onClose(); setSelectedFile(null); } }}>
      <DialogContent className="bg-white border-[#DEE0E3] text-[#1F2329] max-w-sm">
        <DialogHeader><DialogTitle className="text-[15px] font-semibold">上传文件</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <input ref={inputRef} type="file" onChange={handleFileChange} className="hidden" />
          <button
            onClick={() => inputRef.current?.click()}
            className="w-full flex flex-col items-center justify-center gap-2 py-6 rounded-xl border-2 border-dashed border-[#DEE0E3] hover:border-[#3370FF] hover:bg-[#E8F1FF]/30 transition-all"
          >
            <Upload className="w-8 h-8 text-[#3370FF]" />
            <span className="text-[13px] text-[#646A73]">点击选择文件</span>
            <span className="text-[11px] text-[#BBBFC4]">支持 .txt .md .doc .pdf .json .csv 等格式</span>
          </button>
          {selectedFile && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#E8F1FF] border border-[#3370FF]/20">
              <FileText className="w-4 h-4 text-[#3370FF] flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-[13px] text-[#1F2329] truncate">{selectedFile.name}</div>
                <div className="text-[11px] text-[#8F959E]">{(selectedFile.size / 1024).toFixed(1)} KB</div>
              </div>
              <button onClick={() => { setSelectedFile(null); if (inputRef.current) inputRef.current.value = ''; }} className="text-[#BBBFC4] hover:text-[#F54A45]">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => { onClose(); setSelectedFile(null); }} className="text-[13px] border-[#DEE0E3] text-[#646A73]">取消</Button>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || isReading}
            className={`text-[13px] ${selectedFile && !isReading ? 'bg-[#3370FF] text-white hover:bg-[#245BDB]' : 'bg-[#F2F3F5] text-[#BBBFC4] cursor-not-allowed'}`}
          >
            {isReading ? '读取中...' : '上传'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeleteConfirmDialog({ open, onClose, onConfirm, itemName }: { open: boolean; onClose: () => void; onConfirm: () => void; itemName: string }) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-white border-[#DEE0E3] text-[#1F2329] max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-[15px] font-semibold flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-[#F54A45]" />确认删除
          </DialogTitle>
          <DialogDescription className="text-[13px] text-[#8F959E]">
            确定要删除 <span className="font-medium text-[#1F2329]">{itemName}</span> 吗？此操作不可撤销。
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} className="text-[13px] border-[#DEE0E3] text-[#646A73]">取消</Button>
          <Button onClick={onConfirm} className="text-[13px] bg-[#F54A45] text-white hover:bg-[#E04440]">删除</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ===== Dept Structure Edit Dialog =====

function EditDeptStructureDialog({ open, onClose, trees, onTreesChange }: {
  open: boolean; onClose: () => void;
  trees: FileNode[]; onTreesChange: (t: FileNode[]) => void;
}) {
  const [localTrees, setLocalTrees] = useState<FileNode[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [addingFolderId, setAddingFolderId] = useState<string | null>(null);
  const [addName, setAddName] = useState('');

  useEffect(() => {
    if (open) {
      setLocalTrees(JSON.parse(JSON.stringify(trees)));
      setEditingId(null);
      setAddingFolderId(null);
    }
  }, [open, trees]);

  const startRename = (node: FileNode) => { setEditingId(node.id); setEditName(node.name); };

  const confirmRename = () => {
    if (!editName.trim()) return;
    function walk(nodes: FileNode[]): FileNode[] {
      return nodes.map(n => {
        if (n.id === editingId) return { ...n, name: editName.trim() };
        if (n.children) return { ...n, children: walk(n.children) };
        return n;
      });
    }
    setLocalTrees(prev => walk(prev));
    setEditingId(null);
    setEditName('');
  };

  const handleDelete = (targetId: string) => {
    function remove(nodes: FileNode[]): FileNode[] {
      return nodes.filter(n => {
        if (n.id === targetId) return false;
        if (n.children) n.children = remove(n.children);
        return true;
      });
    }
    setLocalTrees(prev => remove(prev));
  };

  const startAddFolder = (parentId: string | null) => { setAddingFolderId(parentId); setAddName(''); };

  const confirmAddFolder = () => {
    if (!addName.trim()) return;
    const newFolder: FileNode = { id: `f-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`, name: addName.trim(), type: 'folder', permission: 'group', children: [] };
    if (addingFolderId === 'ROOT') {
      setLocalTrees(prev => [...prev, newFolder]);
    } else if (addingFolderId) {
      function addTo(nodes: FileNode[]): FileNode[] {
        return nodes.map(n => {
          if (n.id === addingFolderId && n.type === 'folder') return { ...n, children: [...(n.children || []), newFolder] };
          if (n.children) return { ...n, children: addTo(n.children) };
          return n;
        });
      }
      setLocalTrees(prev => addTo(prev));
    } else {
      setLocalTrees(prev => [...prev, newFolder]);
    }
    setAddingFolderId(null);
    setAddName('');
  };

  const handleSave = () => { onTreesChange(localTrees); onClose(); };

  const countItems = (nodes: FileNode[]): number => { let c = 0; nodes.forEach(n => { c++; if (n.children) c += countItems(n.children); }); return c; };

  const renderNode = (node: FileNode, depth: number) => {
    const isEditing = editingId === node.id;
    const isAddingHere = addingFolderId === node.id && node.type === 'folder';
    return (
      <div key={node.id}>
        <div className="flex items-center gap-2 py-1.5 rounded-md hover:bg-[#F2F3F5] group transition-colors" style={{ paddingLeft: `${8 + depth * 20}px`, paddingRight: '4px' }}>
          {node.type === 'folder' ? <Folder className="w-4 h-4 text-[#FF7D00] flex-shrink-0" /> : <FileText className="w-4 h-4 text-[#3370FF] flex-shrink-0" />}
          {isEditing ? (
            <div className="flex items-center gap-1 flex-1 min-w-0">
              <input value={editName} onChange={e => setEditName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') confirmRename(); if (e.key === 'Escape') setEditingId(null); }} autoFocus className="flex-1 min-w-0 px-2 py-1 text-[12px] rounded border border-[#3370FF] bg-white outline-none" />
              <button onClick={confirmRename} className="text-[#00B96B] hover:bg-[#E6F7EF] p-0.5 rounded"><ChevronDown className="w-3 h-3 rotate-[-90deg]" /></button>
              <button onClick={() => setEditingId(null)} className="text-[#F54A45] hover:bg-red-50 p-0.5 rounded"><X className="w-3 h-3" /></button>
            </div>
          ) : (
            <span className="flex items-center flex-1 min-w-0">
              <span className={`text-[12px] flex-1 min-w-0 truncate ${node.type === 'folder' ? 'text-[#1F2329] font-medium' : 'text-[#646A73]'}`}>
                {node.name}{node.size ? <span className="text-[10px] text-[#BBBFC4] ml-1">({node.size})</span> : null}
              </span>
              <span className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <button onClick={() => startRename(node)} title="重命名" className="w-5 h-5 flex items-center justify-center rounded text-[#8F959E] hover:text-[#3370FF] hover:bg-[#E8F1FF]"><Pencil className="w-3 h-3" /></button>
                {node.type === 'folder' && <button onClick={() => startAddFolder(node.id)} title="添加子文件夹" className="w-5 h-5 flex items-center justify-center rounded text-[#8F959E] hover:text-[#00B96B] hover:bg-[#E6F7EF]"><Plus className="w-3 h-3" /></button>}
                <button onClick={() => handleDelete(node.id)} title="删除" className="w-5 h-5 flex items-center justify-center rounded text-[#8F959E] hover:text-[#F54A45] hover:bg-red-50"><Trash2 className="w-3 h-3" /></button>
              </span>
            </span>
          )}
        </div>
        {isAddingHere && (
          <div className="flex items-center gap-1 py-1" style={{ paddingLeft: `${8 + (depth + 1) * 20}px`, paddingRight: '4px' }}>
            <Folder className="w-4 h-4 text-[#FF7D00] flex-shrink-0" />
            <input value={addName} onChange={e => setAddName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') confirmAddFolder(); if (e.key === 'Escape') setAddingFolderId(null); }} autoFocus placeholder="新文件夹名称..." className="flex-1 min-w-0 px-2 py-1 text-[12px] rounded border border-[#00B96B] bg-white outline-none placeholder:text-[#BBBFC4]" />
            <button onClick={confirmAddFolder} className="text-[#00B96B] hover:bg-[#E6F7EF] p-0.5 rounded"><ChevronDown className="w-3 h-3 rotate-[-90deg]" /></button>
            <button onClick={() => setAddingFolderId(null)} className="text-[#F54A45] hover:bg-red-50 p-0.5 rounded"><X className="w-3 h-3" /></button>
          </div>
        )}
        {node.children && node.children.map(child => renderNode(child, depth + 1))}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-white border-[#DEE0E3] text-[#1F2329] max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-[15px] font-semibold flex items-center gap-2"><Settings2 className="w-4 h-4 text-[#3370FF]" />编辑部门文件结构</DialogTitle>
          <DialogDescription className="text-[12px] text-[#8F959E]">管理当前部门下的文件夹和文件，共 {countItems(localTrees)} 个项目</DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2 flex-shrink-0 mb-2">
          <button onClick={() => startAddFolder('ROOT')} className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] font-medium text-[#3370FF] bg-[#E8F1FF] hover:bg-[#D0E0FF] transition-colors"><Plus className="w-3 h-3" />添加文件夹</button>
          {addingFolderId === 'ROOT' && (
            <div className="flex items-center gap-1 flex-1">
              <input value={addName} onChange={e => setAddName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') confirmAddFolder(); if (e.key === 'Escape') setAddingFolderId(null); }} autoFocus placeholder="新文件夹名称..." className="flex-1 min-w-0 px-2 py-1 text-[12px] rounded border border-[#3370FF] bg-white outline-none placeholder:text-[#BBBFC4]" />
              <button onClick={confirmAddFolder} className="text-[#00B96B] hover:bg-[#E6F7EF] p-0.5 rounded"><ChevronDown className="w-3 h-3 rotate-[-90deg]" /></button>
              <button onClick={() => setAddingFolderId(null)} className="text-[#F54A45] hover:bg-red-50 p-0.5 rounded"><X className="w-3 h-3" /></button>
            </div>
          )}
        </div>
        <div className="flex-1 overflow-y-auto border border-[#F2F3F5] rounded-lg p-2 min-h-[200px]">
          {localTrees.length === 0 ? <div className="flex flex-col items-center py-8 text-[#BBBFC4]"><Folder className="w-8 h-8 mb-2" /><p className="text-[12px]">暂无文件，点击上方按钮添加</p></div> : localTrees.map(node => renderNode(node, 0))}
        </div>
        <DialogFooter className="flex-shrink-0 gap-2 mt-2">
          <Button variant="outline" onClick={onClose} className="text-[13px] border-[#DEE0E3] text-[#646A73]">取消</Button>
          <Button onClick={handleSave} className="text-[13px] bg-[#3370FF] text-white hover:bg-[#245BDB]">保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ===== Lark Wiki-style Tree Item =====

function TreeItem({ node, selectedId, expandedIds, onSelect, onToggle, onDelete, onAdd, level = 0 }: {
  node: FileNode; selectedId: string | null; expandedIds: Set<string>; onSelect: (n: FileNode) => void;
  onToggle: (id: string) => void; onDelete: (n: FileNode) => void; onAdd?: (n: FileNode) => void; level?: number;
}) {
  const isExpanded = expandedIds.has(node.id);
  const isSelected = selectedId === node.id;
  const hasChildren = node.type === 'folder' && node.children && node.children.length > 0;
  const isFolder = node.type === 'folder';
  const indent = 18 + level * 18;

  return (
    <div className="relative">
      {/* Row */}
      <div
        className={`flex items-center gap-1 py-[6px] pr-2 rounded-md transition-all duration-150 group cursor-pointer mx-1 ${isSelected ? 'bg-[#E8F1FF]' : 'hover:bg-[#F2F3F5]'}`}
        style={{ paddingLeft: `${indent}px` }}
        onClick={() => {
          if (hasChildren) {
            onToggle(node.id);
          }
          onSelect(node);
        }}
      >
        {/* Expand/collapse: small triangle */}
        {hasChildren ? (
          <button
            onClick={(e) => { e.stopPropagation(); onToggle(node.id); }}
            className="w-4 h-4 flex items-center justify-center flex-shrink-0 text-[#8F959E] hover:text-[#1F2329] transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
          </button>
        ) : (
          <span className="w-4 flex-shrink-0" />
        )}

        {/* Icon: Lark uses simple document icons */}
        {isFolder ? (
          <Folder className="w-[15px] h-[15px] text-[#8F959E] flex-shrink-0" />
        ) : (
          <FileText className="w-[15px] h-[15px] text-[#8F959E] flex-shrink-0" />
        )}

        {/* Name */}
        <span className={`text-[13px] truncate flex-1 min-w-0 ${isSelected ? 'text-[#3370FF] font-medium' : 'text-[#1F2329]'}`}>
          {node.name}
        </span>

        {/* Status badge for files */}
        {!isFolder && node.status && (
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0 mr-1 ${
            node.status === 'indexed'
              ? 'bg-[#E6F7EF] text-[#00B96B]'
              : node.status === 'failed'
              ? 'bg-[#FCE5E4] text-[#F54A45]'
              : 'bg-[#FFF2E0] text-[#FF7D00]'
          }`}>
            {node.statusText || node.status}
          </span>
        )}

        {/* Hover actions: folder shows + for add, all show delete */}
        <span className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          {isFolder && onAdd && (
            <button
              onClick={(e) => { e.stopPropagation(); onAdd(node); }}
              className="w-5 h-5 flex items-center justify-center rounded text-[#BBBFC4] hover:text-[#3370FF] hover:bg-[#E8F1FF] transition-all"
              title="添加子项"
            >
              <Plus className="w-3 h-3" />
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(node); }}
            className="w-5 h-5 flex items-center justify-center rounded text-[#BBBFC4] hover:text-[#F54A45] transition-all"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </span>
      </div>

      {/* Children with vertical guide lines */}
      {hasChildren && isExpanded && (
        <div className="relative">
          {node.children!.map((child, idx) => (
            <div key={child.id} className="relative">
              {/* Vertical line */}
              <div
                className="absolute w-px bg-[#E5E6EB]"
                style={{
                  left: `${indent + 8}px`,
                  top: idx === 0 ? '-2px' : '0',
                  bottom: idx === (node.children!.length - 1) ? '50%' : '0',
                }}
              />
              {/* Horizontal connector */}
              <div
                className="absolute w-[10px] h-px bg-[#E5E6EB]"
                style={{ left: `${indent + 8}px`, top: '14px' }}
              />
              <TreeItem
                node={child}
                selectedId={selectedId}
                expandedIds={expandedIds}
                onSelect={onSelect}
                onToggle={onToggle}
                onDelete={onDelete}
                level={level + 1}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ===== File Preview =====

function FilePreview({ file, path }: { file: FileNode; path: ReturnType<typeof resolvePath> }) {
  const content = file.content || '# 暂无内容\n\n该文件暂无预览内容。';
  const renderContent = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false, codeContent = '', inTable = false, tableRows: string[][] = [];
    const flushCode = () => { if (codeContent) { elements.push(<pre key={`c-${elements.length}`} className="bg-[#F2F3F5] rounded-lg p-4 my-3 overflow-x-auto"><code className="text-[13px] text-[#3370FF] font-mono whitespace-pre">{codeContent}</code></pre>); codeContent = ''; } };
    const flushTable = () => { if (tableRows.length > 0) { elements.push(<table key={`t-${elements.length}`} className="w-full my-3 border-collapse"><thead><tr className="bg-[#F2F3F5]">{tableRows[0].map((c, i) => <th key={i} className="text-left px-3 py-2 text-[12px] text-[#8F959E] font-medium border border-[#DEE0E3]">{c}</th>)}</tr></thead><tbody>{tableRows.slice(2).map((r, ri) => <tr key={ri} className="hover:bg-[#F8F9FA]">{r.map((c, ci) => <td key={ci} className="px-3 py-2 text-[13px] text-[#1F2329] border border-[#EBEBEB]">{c}</td>)}</tr>)}</tbody></table>); tableRows = []; } };
    lines.forEach((line, i) => {
      const t = line.trim();
      if (t.startsWith('```')) { if (inCodeBlock) { flushCode(); inCodeBlock = false; } else inCodeBlock = true; return; }
      if (inCodeBlock) { codeContent += line + '\n'; return; }
      if (t.includes('|')) { const cells = t.split('|').filter(c => c.trim()).map(c => c.trim()); if (cells.length > 0 && !cells.every(c => /^-+$/.test(c))) tableRows.push(cells); inTable = true; return; }
      else if (inTable) { flushTable(); inTable = false; }
      if (t.startsWith('# ')) elements.push(<h1 key={i} className="text-[22px] font-semibold text-[#1F2329] mt-6 mb-3">{t.slice(2)}</h1>);
      else if (t.startsWith('## ')) elements.push(<h2 key={i} className="text-[18px] font-semibold text-[#1F2329] mt-5 mb-2">{t.slice(3)}</h2>);
      else if (t.startsWith('### ')) elements.push(<h3 key={i} className="text-[15px] font-semibold text-[#1F2329] mt-4 mb-2">{t.slice(4)}</h3>);
      else if (t.startsWith('- ')) elements.push(<div key={i} className="flex items-start gap-2 my-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#8F959E] mt-2 flex-shrink-0" /><span className="text-[14px] text-[#646A73] leading-relaxed">{t.slice(2)}</span></div>);
      else if (/^\d+\.\s/.test(t)) {
        const m = t.match(/^\d+/);
        elements.push(<div key={i} className="flex items-start gap-2 my-1.5"><span className="text-[14px] text-[#3370FF] font-medium flex-shrink-0 w-5">{m?.[0]}.</span><span className="text-[14px] text-[#646A73] leading-relaxed">{t.replace(/^\d+\.\s/, '')}</span></div>);
      } else if (t) elements.push(<p key={i} className="text-[14px] text-[#646A73] leading-relaxed my-2">{t}</p>);
      else elements.push(<div key={i} className="h-2" />);
    });
    if (inCodeBlock) flushCode(); if (inTable) flushTable();
    return elements;
  };

  return (
    <div className="max-w-[800px] mx-auto">
      {path && (
        <div className="flex items-center gap-1.5 text-[11px] text-[#BBBFC4] mb-6 flex-wrap">
          <span>{path.group}</span><ChevronRight className="w-2.5 h-2.5" /><span className="text-[#8F959E]">{path.subGroup}</span><ChevronRight className="w-2.5 h-2.5" />
          <span className="text-[#646A73]">{path.company}</span><ChevronRight className="w-2.5 h-2.5" /><span className="text-[#1F2329]">{path.department}</span>
          <ChevronRight className="w-2.5 h-2.5" /><span className="text-[#3370FF] font-medium">{file.name}</span>
        </div>
      )}
      <div className="bg-white rounded-xl p-8 border border-[#DEE0E3] shadow-sm">{renderContent(content)}</div>
    </div>
  );
}

// ===== Feishu-style Main Module =====

export function KnowledgeBaseMiddlePanel({ deptPath, selectedNodeId, onSelectNode }: { deptPath: string; selectedNodeId: string | null; onSelectNode: (node: FileNode) => void; }) {
  const [data, setData] = useState<Record<string, FileNode[]>>({ ...initialData });
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  // Admin dialog states
  const [addFolderOpen, setAddFolderOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<FileNode | null>(null);
  const [structureEditOpen, setStructureEditOpen] = useState(false);
  const [uploadTargetId, setUploadTargetId] = useState<string | null>(null);

  const trees = data[deptPath] || [];
  const pathInfo = resolvePath(deptPath);

  const handleToggle = useCallback((id: string) => {
    setExpandedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }, []);

  // Filter trees by search
  const filteredTrees = searchQuery.trim()
    ? trees.filter(node => filterNode(node, searchQuery.trim()))
    : trees;

  // Auto-expand when searching
  useEffect(() => {
    if (searchQuery.trim()) {
      const matched = new Set<string>();
      function collectIds(nodes: FileNode[]) {
        nodes.forEach(n => {
          if (n.children) {
            collectIds(n.children);
            // Expand parent if any child matches
            if (n.children.some(c => c.name.toLowerCase().includes(searchQuery.trim().toLowerCase()))) matched.add(n.id);
          }
          if (n.name.toLowerCase().includes(searchQuery.trim().toLowerCase())) matched.add(n.id);
        });
      }
      collectIds(trees);
      setExpandedIds(prev => new Set([...prev, ...matched]));
    }
  }, [searchQuery, trees]);

  const handleAddFolder = useCallback((name: string) => {
    setData(prev => {
      const deptTrees = [...(prev[deptPath] || [])];
      deptTrees.push({ id: `f-${Date.now()}`, name, type: 'folder', permission: 'group', children: [] });
      return { ...prev, [deptPath]: deptTrees };
    });
    setAddFolderOpen(false);
  }, [deptPath]);

  const handleUploadFile = useCallback(async (name: string, content: string) => {
    // 用 mock File 对象走 BFF 上传语义，后续直接替换为真实文件上传
    const mockFile = new File([content], name, { type: 'text/plain' });
    const uploaded = await bffService.knowledge.uploadDocument({
      datasetId: deptPath,
      file: mockFile,
    });

    const newFile: FileNode = {
      id: `fl-${Date.now()}`,
      name: uploaded.name,
      type: 'file',
      size: uploaded.size,
      modifiedAt: new Date().toISOString().slice(0, 10),
      permission: 'group',
      content,
      status: uploaded.status,
      statusText: uploaded.statusText,
      documentId: uploaded.id,
    };

    setData(prev => {
      const deptTrees = [...(prev[deptPath] || [])];

      if (uploadTargetId) {
        // Add to specific folder
        function addToFolder(nodes: FileNode[]): FileNode[] {
          return nodes.map(n => {
            if (n.id === uploadTargetId && n.type === 'folder') {
              return { ...n, children: [...(n.children || []), newFile] };
            }
            if (n.children) return { ...n, children: addToFolder(n.children) };
            return n;
          });
        }
        return { ...prev, [deptPath]: addToFolder(deptTrees) };
      }

      // Add to root
      deptTrees.push(newFile);
      return { ...prev, [deptPath]: deptTrees };
    });
    setUploadOpen(false);
    setUploadTargetId(null);
  }, [deptPath, uploadTargetId]);

  const handleDeleteClick = useCallback((node: FileNode) => { setDeleteTarget(node); setDeleteOpen(true); }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    if (deleteTarget.documentId) {
      await bffService.knowledge.deleteDocument(deleteTarget.documentId);
    }
    setData(prev => {
      const deptTrees = [...(prev[deptPath] || [])];
      const removeNode = (nodes: FileNode[]): FileNode[] => nodes.filter(n => { if (n.id === deleteTarget.id) return false; if (n.children) n.children = removeNode(n.children); return true; });
      return { ...prev, [deptPath]: removeNode(deptTrees) };
    });
    setDeleteOpen(false);
    setDeleteTarget(null);
  }, [deptPath, deleteTarget]);

  return (
    <div className="flex flex-col h-full bg-[#F5F6F7]">
      {/* ===== Lark Wiki-style Header ===== */}
      <div className="bg-[#F5F6F7] flex-shrink-0">
        {/* Title row */}
        <div className="flex items-center justify-between px-3 pt-3 pb-2">
          <div className="flex items-center gap-1.5 min-w-0">
            {pathInfo ? (
              <h2 className="text-[14px] font-semibold text-[#1F2329] truncate">{pathInfo.department}</h2>
            ) : (
              <h2 className="text-[14px] font-semibold text-[#1F2329]">知识库</h2>
            )}
            <ChevronDown className="w-3.5 h-3.5 text-[#8F959E] flex-shrink-0" />
          </div>
          <div className="flex gap-0.5 flex-shrink-0">
            <button className="w-7 h-7 flex items-center justify-center rounded-md text-[#8F959E] hover:text-[#1F2329] hover:bg-[#EBEBEB] transition-colors" title="分享">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            </button>
            <button onClick={() => setStructureEditOpen(true)} className="w-7 h-7 flex items-center justify-center rounded-md text-[#8F959E] hover:text-[#1F2329] hover:bg-[#EBEBEB] transition-colors" title="编辑结构">
              <Settings2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Search box */}
        <div className="px-3 pb-2">
          <div className="flex items-center gap-1.5 bg-white rounded-lg px-3 py-2 border border-[#E5E6EB] focus-within:border-[#3370FF] focus-within:ring-1 focus-within:ring-[#3370FF]/10 transition-all">
            <Search className="w-3.5 h-3.5 text-[#BBBFC4] flex-shrink-0" />
            <input
              type="text"
              placeholder="搜索"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-[12px] text-[#1F2329] placeholder:text-[#BBBFC4] outline-none min-w-0"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-[#BBBFC4] hover:text-[#646A73]"><X className="w-3 h-3" /></button>
            )}
          </div>
        </div>
      </div>

      {/* ===== Page Tree Header ===== */}
      <div className="flex items-center justify-between px-3 py-1.5 flex-shrink-0">
        <span className="text-[11px] text-[#8F959E] font-medium">页面树</span>
        {/* Top-level add: new folder */}
        <button
          onClick={() => setAddFolderOpen(true)}
          className="w-5 h-5 flex items-center justify-center rounded text-[#8F959E] hover:text-[#3370FF] hover:bg-[#E8F1FF] transition-colors"
          title="新建文件夹"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ===== File Tree - Lark Wiki style ===== */}
      <div className="flex-1 overflow-y-auto px-1 pb-2">
        {filteredTrees.length > 0 ? filteredTrees.map(node => (
          <TreeItem
            key={node.id}
            node={node}
            selectedId={selectedNodeId}
            expandedIds={expandedIds}
            onSelect={onSelectNode}
            onToggle={handleToggle}
            onDelete={handleDeleteClick}
            onAdd={(folderNode) => { setUploadTargetId(folderNode.id); setUploadOpen(true); }}
          />
        )) : (
          <div className="flex flex-col items-center justify-center py-16">
            <BookOpen className="w-10 h-10 text-[#DEE0E3] mb-3" />
            <p className="text-[13px] text-[#8F959E]">{searchQuery ? '未找到匹配的文件' : '暂无文件'}</p>
            {!searchQuery && <p className="text-[11px] text-[#BBBFC4] mt-1">点击 + 新建文件夹，或选择文件夹添加文件</p>}
          </div>
        )}
      </div>

      {/* ===== Bottom Toolbar ===== */}
      <div className="flex items-center justify-around px-3 py-2 border-t border-[#DEE0E3] bg-white flex-shrink-0">
        <button className="w-7 h-7 flex items-center justify-center rounded-md text-[#8F959E] hover:text-[#3370FF] hover:bg-[#E8F1FF] transition-colors" title="分享">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
        </button>
        <button onClick={() => setStructureEditOpen(true)} className="w-7 h-7 flex items-center justify-center rounded-md text-[#8F959E] hover:text-[#3370FF] hover:bg-[#E8F1FF] transition-colors" title="编辑结构">
          <Settings2 className="w-3.5 h-3.5" />
        </button>
        <button className="w-7 h-7 flex items-center justify-center rounded-md text-[#8F959E] hover:text-[#F54A45] hover:bg-red-50 transition-colors" title="删除">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Admin Dialogs */}
      <AddFolderDialog open={addFolderOpen} onClose={() => setAddFolderOpen(false)} onConfirm={handleAddFolder} />
      <UploadFileDialog
        open={uploadOpen}
        onClose={() => { setUploadOpen(false); setUploadTargetId(null); }}
        onConfirm={handleUploadFile}
      />
      <DeleteConfirmDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleConfirmDelete} itemName={deleteTarget?.name || ''} />
      <EditDeptStructureDialog
        open={structureEditOpen}
        onClose={() => setStructureEditOpen(false)}
        trees={trees}
        onTreesChange={(newTrees) => { setData(prev => ({ ...prev, [deptPath]: newTrees })); }}
      />
    </div>
  );
}

/** Filter nodes recursively by search query */
function filterNode(node: FileNode, query: string): boolean {
  if (node.name.toLowerCase().includes(query.toLowerCase())) return true;
  if (node.children) return node.children.some(c => filterNode(c, query));
  return false;
}

// ===== Retrieval Test Panel =====

function RetrievalTestPanel({ datasetId }: { datasetId: string }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ content: string; score: number }[]>([]);
  const [loading, setLoading] = useState(false);

  const handleTest = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await bffService.knowledge.testRetrieval(datasetId, query.trim());
      setResults(res.results.map(r => ({ content: r.content, score: r.score || 0 })));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-[#DEE0E3] p-4 mt-4">
      <div className="flex items-center gap-2 mb-3">
        <Beaker className="w-4 h-4 text-[#3370FF]" />
        <span className="text-[13px] font-medium text-[#1F2329]">检索测试</span>
      </div>
      <div className="flex gap-2 mb-3">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleTest(); }}
          placeholder="输入测试问题，查看召回分片"
          className="flex-1 px-3 py-2 text-[13px] rounded-lg bg-[#F2F3F5] border border-transparent focus:border-[#3370FF] outline-none"
        />
        <button
          onClick={handleTest}
          disabled={loading || !query.trim()}
          className="px-3 py-2 rounded-lg text-[13px] font-medium text-white bg-[#3370FF] hover:bg-[#245BDB] disabled:bg-[#BBBFC4]"
        >
          {loading ? '测试中...' : '测试'}
        </button>
      </div>
      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((r, idx) => (
            <div key={idx} className="p-3 rounded-lg bg-[#F8F9FA] border border-[#F2F3F5]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-[#8F959E]">分片 {idx + 1}</span>
                <span className="text-[11px] font-medium text-[#3370FF]">{(r.score * 100).toFixed(1)}%</span>
              </div>
              <p className="text-[13px] text-[#1F2329]">{r.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ===== Feishu-style Right Panel =====

export function KnowledgeBaseRightPanel({ file, deptPath }: { file: FileNode | null; deptPath: string }) {
  const pathInfo = resolvePath(deptPath);
  if (!file) return (
    <div className="flex flex-col items-center justify-center h-full bg-[#F5F6F7]">
      <div className="w-16 h-16 rounded-2xl bg-[#EBEBEB] flex items-center justify-center mb-4">
        <BookOpen className="w-8 h-8 text-[#BBBFC4]" />
      </div>
      <h3 className="text-[15px] text-[#646A73] font-medium">选择文件预览</h3>
      <p className="text-[12px] text-[#BBBFC4] mt-1">点击左侧知识库中的文件查看详细内容</p>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-[#F5F6F7]">
      {/* Feishu-style header */}
      <div className="flex items-center justify-between px-5 py-3 bg-white border-b border-[#DEE0E3] flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#E8F1FF] flex items-center justify-center flex-shrink-0">
            <FileText className="w-4 h-4 text-[#3370FF]" />
          </div>
          <div className="min-w-0">
            <span className="text-[14px] font-medium text-[#1F2329] truncate block">{file.name}</span>
            <span className="text-[11px] text-[#BBBFC4]">{file.size} · {file.modifiedAt || '2026-06-16'}</span>
          </div>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <button className="w-7 h-7 flex items-center justify-center rounded-md text-[#BBBFC4] hover:text-[#1F2329] hover:bg-[#F2F3F5] transition-colors">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        <FilePreview file={file} path={pathInfo} />
        <RetrievalTestPanel datasetId={deptPath} />
      </div>
    </div>
  );
}
