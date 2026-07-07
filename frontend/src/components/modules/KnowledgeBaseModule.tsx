import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
  Folder, FileText, ChevronRight, ChevronDown, Trash2, BookOpen, Upload, X,
  Pencil, Search, MoreHorizontal, Beaker, Download
} from 'lucide-react';
import type { FileNode } from '@/types';
import { bffService, type BffDataset, type BffDocument } from '@/services/bffService';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const statusDisplayMap: Record<string, string> = {
  uploaded: '已上传',
  parsing: '解析中',
  parsed: '已解析',
  embedding: '嵌入中',
  indexing: '处理中',
  indexed: '已索引',
  failed: '失败',
  deleted: '已删除',
  available: '已完成',
  error: '错误',
  pending: '待处理',
};

function getStatusDisplay(node: FileNode): string {
  const rawStatus = node.status ? String(node.status).trim().toLowerCase() : '';
  if (rawStatus && statusDisplayMap[rawStatus]) {
    return statusDisplayMap[rawStatus];
  }
  const rawText = node.statusText ? String(node.statusText).trim().toLowerCase() : '';
  if (rawText && statusDisplayMap[rawText]) {
    return statusDisplayMap[rawText];
  }
  return node.statusText || node.status || '';
}

function toFileNode(doc: BffDocument): FileNode {
  return {
    id: doc.id,
    name: doc.name,
    type: 'file',
    size: doc.size,
    modifiedAt: doc.updatedAt,
    permission: 'group',
    status: doc.status,
    statusText: doc.statusText,
    documentId: doc.id,
  };
}

// ===== Dialogs =====

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

function UploadDocumentDialog({ open, datasetId, onClose, onUploaded }: { open: boolean; datasetId: string; onClose: () => void; onUploaded: (docs: BffDocument[]) => void; }) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) { setFiles([]); setUploading(false); }
  }, [open]);

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length === 0) return;
    setFiles(prev => {
      const existing = new Set(prev.map(f => f.name));
      return [...prev, ...selected.filter(f => !existing.has(f.name))];
    });
    // 允许重复选择同一文件
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);
    try {
      const docs = await bffService.knowledge.uploadDocuments({ datasetId, files });
      onUploaded(docs);
      onClose();
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="bg-white border-[#DEE0E3] text-[#1F2329] max-w-sm">
        <DialogHeader><DialogTitle className="text-[15px] font-semibold">上传文件</DialogTitle></DialogHeader>
        <div className="space-y-3 max-h-[320px] overflow-y-auto">
          <input ref={inputRef} type="file" multiple onChange={handleFilesChange} className="hidden" />
          <button
            onClick={() => inputRef.current?.click()}
            className="w-full flex flex-col items-center justify-center gap-2 py-6 rounded-xl border-2 border-dashed border-[#DEE0E3] hover:border-[#3370FF] hover:bg-[#E8F1FF]/30 transition-all"
          >
            <Upload className="w-8 h-8 text-[#3370FF]" />
            <span className="text-[13px] text-[#646A73]">{files.length > 0 ? '继续添加文件' : '点击选择文件'}</span>
            <span className="text-[11px] text-[#BBBFC4]">支持 .txt .md .doc .pdf .json .csv 等格式，可多选</span>
          </button>
          {files.length > 0 && (
            <div className="space-y-2">
              {files.map((file, idx) => (
                <div key={`${file.name}-${idx}`} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#E8F1FF] border border-[#3370FF]/20">
                  <FileText className="w-4 h-4 text-[#3370FF] flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] text-[#1F2329] truncate">{file.name}</div>
                    <div className="text-[11px] text-[#8F959E]">{formatSize(file.size)}</div>
                  </div>
                  <button onClick={() => removeFile(idx)} className="text-[#BBBFC4] hover:text-[#F54A45]"><X className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          )}
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} className="text-[13px] border-[#DEE0E3] text-[#646A73]">取消</Button>
          <Button
            onClick={handleUpload}
            disabled={files.length === 0 || uploading}
            className={`text-[13px] ${files.length > 0 && !uploading ? 'bg-[#3370FF] text-white hover:bg-[#245BDB]' : 'bg-[#F2F3F5] text-[#BBBFC4] cursor-not-allowed'}`}
          >
            {uploading ? '上传中...' : `上传 (${files.length})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditDatasetDialog({ open, dataset, onClose, onSave }: { open: boolean; dataset: BffDataset | null; onClose: () => void; onSave: (name: string, description: string) => void; }) {
  const [name, setName] = useState(dataset?.name || '');
  const [description, setDescription] = useState(dataset?.description || '');

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-white border-[#DEE0E3] text-[#1F2329] max-w-sm">
        <DialogHeader><DialogTitle className="text-[15px] font-semibold">编辑知识库信息</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="block text-[12px] text-[#8F959E] mb-1">名称</label>
            <input value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-[#F2F3F5] border border-transparent focus:border-[#3370FF] text-[13px] outline-none" />
          </div>
          <div>
            <label className="block text-[12px] text-[#8F959E] mb-1">描述</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full px-3 py-2 rounded-lg bg-[#F2F3F5] border border-transparent focus:border-[#3370FF] text-[13px] outline-none resize-none" />
          </div>
        </div>
        <DialogFooter className="gap-2 mt-2">
          <Button variant="outline" onClick={onClose} className="text-[13px] border-[#DEE0E3] text-[#646A73]">取消</Button>
          <Button onClick={() => onSave(name, description)} className="text-[13px] bg-[#3370FF] text-white hover:bg-[#245BDB]">保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ===== Lark Wiki-style Tree Item =====

function TreeItem({ node, selectedId, onSelect, onDownload, onDelete }: {
  node: FileNode; selectedId: string | null;
  onSelect: (n: FileNode) => void; onDownload: (n: FileNode) => void; onDelete?: (n: FileNode) => void;
}) {
  const isSelected = selectedId === node.id;
  const isFolder = node.type === 'folder';

  return (
    <div
      className={`flex items-center gap-2 py-[6px] pr-2 rounded-md transition-all duration-150 group cursor-pointer mx-1 ${isSelected ? 'bg-[#E8F1FF]' : 'hover:bg-[#F2F3F5]'}`}
      onClick={() => onSelect(node)}
    >
      <span className="w-4 flex-shrink-0" />
      {isFolder ? (
        <Folder className="w-[15px] h-[15px] text-[#8F959E] flex-shrink-0" />
      ) : (
        <FileText className="w-[15px] h-[15px] text-[#8F959E] flex-shrink-0" />
      )}
      <span className={`text-[13px] truncate flex-1 min-w-0 ${isSelected ? 'text-[#3370FF] font-medium' : 'text-[#1F2329]'}`}>
        {node.name}
      </span>
      {!isFolder && node.status && (
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0 mr-1 ${
          node.status === 'indexed' || node.status === 'available'
            ? 'bg-[#E6F7EF] text-[#00B96B]'
            : node.status === 'failed' || node.status === 'error'
            ? 'bg-[#FCE5E4] text-[#F54A45]'
            : 'bg-[#FFF2E0] text-[#FF7D00]'
        }`}>
          {getStatusDisplay(node)}
        </span>
      )}
      {!isFolder && (
        <span className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); onDownload(node); }}
            className="w-5 h-5 flex items-center justify-center rounded text-[#BBBFC4] hover:text-[#3370FF] hover:bg-[#E8F1FF] transition-all"
            title="下载"
          >
            <Download className="w-3 h-3" />
          </button>
          {onDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(node); }}
              className="w-5 h-5 flex items-center justify-center rounded text-[#BBBFC4] hover:text-[#F54A45] hover:bg-red-50 transition-all"
              title="删除"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </span>
      )}
    </div>
  );
}

// ===== File Preview =====

const OFFICE_EXTENSIONS = new Set([
  'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
]);

const IMAGE_EXTENSIONS = new Set([
  'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico',
]);

function getFileExtension(name: string): string {
  const parts = name.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

function isPdfFile(name: string): boolean {
  return getFileExtension(name) === 'pdf';
}

function isImageFile(name: string): boolean {
  return IMAGE_EXTENSIONS.has(getFileExtension(name));
}

function isOfficeFile(name: string): boolean {
  return OFFICE_EXTENSIONS.has(getFileExtension(name));
}

function isMarkdownFile(name: string): boolean {
  const ext = getFileExtension(name);
  return ext === 'md' || ext === 'markdown';
}

function isDocxFile(name: string): boolean {
  return getFileExtension(name) === 'docx';
}

function isXlsxFile(name: string): boolean {
  const ext = getFileExtension(name);
  return ext === 'xlsx' || ext === 'xls';
}

function isPptxFile(name: string): boolean {
  return getFileExtension(name) === 'pptx';
}

async function convertDocxToHtml(blob: Blob): Promise<string> {
  const mammoth = await import('mammoth');
  const arrayBuffer = await blob.arrayBuffer();
  const result = await mammoth.default.convertToHtml({ arrayBuffer });
  return result.value;
}

async function convertXlsxToHtml(blob: Blob): Promise<string> {
  const XLSX = await import('xlsx');
  const arrayBuffer = await blob.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  let html = '';
  for (const sheetName of workbook.SheetNames) {
    const worksheet = workbook.Sheets[sheetName];
    html += `<h4 class="text-[14px] font-semibold text-[#1F2329] mt-4 mb-2">${sheetName}</h4>`;
    html += XLSX.utils.sheet_to_html(worksheet, { id: '', editable: false });
  }
  return html;
}

async function convertPptxToText(blob: Blob): Promise<string> {
  const JSZip = (await import('jszip')).default;
  const arrayBuffer = await blob.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);
  const slideNames = Object.keys(zip.files)
    .filter(path => /^ppt\/slides\/slide\d+\.xml$/.test(path))
    .sort();
  const parts: string[] = [];
  for (const name of slideNames) {
    const xml = await zip.files[name].async('string');
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'application/xml');
    const texts = Array.from(doc.getElementsByTagName('a:t')).map(t => t.textContent || '').filter(Boolean);
    if (texts.length > 0) {
      parts.push(`--- ${name.replace('ppt/slides/', '').replace('.xml', '')} ---\n${texts.join('\n')}`);
    }
  }
  return parts.length > 0 ? parts.join('\n\n') : '无法提取 PPT 内容';
}

function looksLikeBinary(text: string): boolean {
  // 出现大量 Unicode 替换字符或大量不可打印控制字符，说明是二进制被当文本读取
  const replacement = (text.match(/\uFFFD/g) || []).length;
  let control = 0;
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code < 32 && code !== 9 && code !== 10 && code !== 13) control++;
  }
  return replacement > 10 || (text.length > 0 && control > text.length * 0.05);
}

function FilePreview({ file, datasetName, content, fileUrl, officeHtml, officeError }: {
  file: FileNode;
  datasetName: string;
  content: string;
  fileUrl: string | null;
  officeHtml: string | null;
  officeError: string | null;
}) {
  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false, codeContent = '', inTable = false, tableRows: string[][] = [];
    const flushCode = () => { if (codeContent) { elements.push(<pre key={`c-${elements.length}`} className="bg-[#F2F3F5] rounded-lg p-4 my-3 overflow-x-auto"><code className="text-[13px] text-[#3370FF] font-mono whitespace-pre-wrap break-words">{codeContent}</code></pre>); codeContent = ''; } };
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

  const renderPlainText = (text: string) => (
    <pre className="whitespace-pre-wrap break-words font-mono text-[14px] text-[#1F2329] leading-relaxed">
      {text}
    </pre>
  );

  const renderUnsupported = () => (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <FileText className="w-12 h-12 text-[#DEE0E3] mb-4" />
      <p className="text-[14px] text-[#646A73] mb-1">该文件类型暂不支持预览</p>
      <p className="text-[12px] text-[#BBBFC4]">请点击右上角下载按钮查看文件内容</p>
    </div>
  );

  let body: React.ReactNode;
  if (officeError) {
    body = (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <FileText className="w-12 h-12 text-[#DEE0E3] mb-4" />
        <p className="text-[14px] text-[#646A73] mb-1">{officeError}</p>
        <p className="text-[12px] text-[#BBBFC4]">请点击右上角下载按钮查看文件内容</p>
      </div>
    );
  } else if (isDocxFile(file.name) && officeHtml) {
    body = (
      <div
        className="docx-preview text-[14px] text-[#1F2329] leading-relaxed break-words"
        dangerouslySetInnerHTML={{ __html: officeHtml }}
      />
    );
  } else if (isXlsxFile(file.name) && officeHtml) {
    body = (
      <div
        className="xlsx-preview overflow-x-auto text-[13px]"
        dangerouslySetInnerHTML={{ __html: officeHtml }}
      />
    );
  } else if (isPptxFile(file.name)) {
    body = renderPlainText(content);
  } else if (isPdfFile(file.name) && fileUrl) {
    body = (
      <iframe
        src={fileUrl}
        title={file.name}
        className="w-full min-h-[70vh] rounded-lg border border-[#DEE0E3]"
      />
    );
  } else if (isImageFile(file.name) && fileUrl) {
    body = (
      <img
        src={fileUrl}
        alt={file.name}
        className="max-w-full h-auto rounded-lg border border-[#DEE0E3]"
      />
    );
  } else if (isOfficeFile(file.name)) {
    body = renderUnsupported();
  } else if (looksLikeBinary(content)) {
    body = renderUnsupported();
  } else if (isMarkdownFile(file.name)) {
    body = renderMarkdown(content);
  } else {
    body = renderPlainText(content);
  }

  return (
    <div className="max-w-[800px] mx-auto pb-6">
      <div className="flex items-center gap-1.5 text-[11px] text-[#BBBFC4] mb-6 flex-wrap">
        <span>{datasetName}</span>
        <ChevronRight className="w-2.5 h-2.5" />
        <span className="text-[#3370FF] font-medium">{file.name}</span>
      </div>
      <div className="bg-white rounded-xl p-6 border border-[#DEE0E3] shadow-sm">{body}</div>
    </div>
  );
}

// ===== Feishu-style Main Module =====

export function KnowledgeBaseMiddlePanel({ deptPath, selectedNodeId, onSelectNode, onDatasetDeleted }: { deptPath: string; selectedNodeId: string | null; onSelectNode: (node: FileNode | null) => void; onDatasetDeleted?: () => void; }) {
  const [documents, setDocuments] = useState<BffDocument[]>([]);
  const [datasetInfo, setDatasetInfo] = useState<BffDataset | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteDatasetOpen, setDeleteDatasetOpen] = useState(false);
  const [deleteDoc, setDeleteDoc] = useState<FileNode | null>(null);
  const [pollingDocIds, setPollingDocIds] = useState<string[]>([]);

  const loadDocuments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const docs = await bffService.knowledge.listDocuments(deptPath);
      setDocuments(docs);
    } catch (err: unknown) {
      const maybe404 = err instanceof Error && err.message.includes('404');
      if (maybe404) {
        try {
          const name = datasetInfo?.name || deptPath;
          const created = await bffService.knowledge.createDataset({ name, description: '' });
          setDatasetInfo(created);
          const docs = await bffService.knowledge.listDocuments(deptPath);
          setDocuments(docs);
        } catch {
          setError('自动创建知识库失败');
        }
      } else {
        setError('加载文档失败');
      }
    } finally {
      setLoading(false);
    }
  }, [deptPath, datasetInfo?.name]);

  const loadDatasetInfo = useCallback(async () => {
    try {
      const all = await bffService.knowledge.listDatasets();
      setDatasetInfo(all.find(d => d.id === deptPath) || null);
    } catch {
      setDatasetInfo(null);
    }
  }, [deptPath]);

  useEffect(() => {
    loadDocuments();
    loadDatasetInfo();
  }, [loadDocuments, loadDatasetInfo]);

  const fileNodes = useMemo(() => {
    const nodes = documents.map(toFileNode);
    if (!searchQuery.trim()) return nodes;
    const q = searchQuery.trim().toLowerCase();
    return nodes.filter(n => n.name.toLowerCase().includes(q));
  }, [documents, searchQuery]);

  const handleDeleteDataset = useCallback(async () => {
    await bffService.knowledge.deleteDataset(deptPath);
    setDeleteDatasetOpen(false);
    setDocuments([]);
    setDatasetInfo(null);
    onDatasetDeleted?.();
  }, [deptPath, onDatasetDeleted]);

  const handleDeleteDocument = useCallback(async () => {
    if (!deleteDoc?.documentId) return;
    try {
      await bffService.knowledge.deleteDocument(deptPath, deleteDoc.documentId);
      setDeleteDoc(null);
      // 如果删除的是当前选中的文档，取消选中
      if (selectedNodeId === deleteDoc.id) {
        onSelectNode(null);
      }
      await loadDocuments();
    } catch (err: unknown) {
      console.error('[KnowledgeBase] delete document failed:', err);
      const msg = err instanceof Error ? err.message : '删除文档失败';
      window.alert(`删除文档失败：${msg}`);
    }
  }, [deleteDoc, deptPath, loadDocuments, onSelectNode, selectedNodeId]);

  const handleUpdateDataset = useCallback(async (name: string, description: string) => {
    await bffService.knowledge.updateDataset(deptPath, { name, description });
    setEditOpen(false);
    await loadDatasetInfo();
  }, [deptPath, loadDatasetInfo]);

  const handleDownload = useCallback(async (node: FileNode) => {
    if (!node.documentId) return;
    const blob = await bffService.knowledge.downloadDocument(deptPath, node.documentId);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = node.name;
    a.click();
    URL.revokeObjectURL(url);
  }, [deptPath]);

  // 上传后局部轮询文档索引状态
  const handleUploaded = useCallback((docs: BffDocument[]) => {
    if (docs.length === 0) return;
    // 立即刷新一次列表，确保新文件出现
    loadDocuments();
    // 对未处理完成的文档开启轮询
    const unfinished = docs.filter(d => d.status !== 'available' && d.status !== 'error').map(d => d.id);
    if (unfinished.length > 0) {
      setPollingDocIds(unfinished);
    }
  }, [loadDocuments]);

  useEffect(() => {
    if (pollingDocIds.length === 0) return;
    let attempts = 0;
    const maxAttempts = 20;
    const timer = setInterval(async () => {
      attempts++;
      try {
        const latestDocs = await bffService.knowledge.listDocuments(deptPath);
        setDocuments(prev => {
          const map = new Map(prev.map(d => [d.id, d]));
          for (const d of latestDocs) {
            const existing = map.get(d.id);
            if (existing) {
              // 只更新状态和计数，保留其他字段
              map.set(d.id, { ...existing, status: d.status, statusText: d.statusText, updatedAt: d.updatedAt });
            } else if (pollingDocIds.includes(d.id)) {
              map.set(d.id, d);
            }
          }
          return Array.from(map.values());
        });
        const statuses = latestDocs
          .filter(d => pollingDocIds.includes(d.id))
          .map(d => d.status);
        if (statuses.every(s => s === 'available' || s === 'error') || attempts >= maxAttempts) {
          clearInterval(timer);
          setPollingDocIds([]);
        }
      } catch {
        if (attempts >= maxAttempts) {
          clearInterval(timer);
          setPollingDocIds([]);
        }
      }
    }, 3000);
    return () => clearInterval(timer);
  }, [pollingDocIds, deptPath]);

  if (!deptPath) {
    return (
      <div className="flex flex-col h-full bg-[#F5F6F7] items-center justify-center text-[#8F959E]">
        <BookOpen className="w-10 h-10 text-[#DEE0E3] mb-3" />
        <p className="text-[13px]">请在左侧选择一个知识库</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#F5F6F7]">
      {/* Header */}
      <div className="bg-[#F5F6F7] flex-shrink-0">
        <div className="flex items-center justify-between px-3 pt-3 pb-2 pr-12">
          <div className="flex items-center gap-1.5 min-w-0">
            {datasetInfo ? (
              <h2 className="text-[14px] font-semibold text-[#1F2329] truncate">{datasetInfo.name}</h2>
            ) : (
              <h2 className="text-[14px] font-semibold text-[#1F2329]">知识库</h2>
            )}
            <ChevronDown className="w-3.5 h-3.5 text-[#8F959E] flex-shrink-0" />
            {datasetInfo && (
              <span className="text-[11px] text-[#8F959E]">{datasetInfo.documentCount || documents.length} 个文档</span>
            )}
          </div>
          <div className="flex gap-0.5 flex-shrink-0">
            <button onClick={() => setUploadOpen(true)} className="w-7 h-7 flex items-center justify-center rounded-md text-[#8F959E] hover:text-[#3370FF] hover:bg-[#E8F1FF] transition-colors" title="上传文件">
              <Upload className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setEditOpen(true)} className="w-7 h-7 flex items-center justify-center rounded-md text-[#8F959E] hover:text-[#3370FF] hover:bg-[#E8F1FF] transition-colors" title="编辑知识库信息">
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setDeleteDatasetOpen(true)} className="w-7 h-7 flex items-center justify-center rounded-md text-[#8F959E] hover:text-[#F54A45] hover:bg-red-50 transition-colors" title="删除知识库">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="px-3 pb-2">
          <div className="flex items-center gap-1.5 bg-white rounded-lg px-3 py-2 border border-[#E5E6EB] focus-within:border-[#3370FF] focus-within:ring-1 focus-within:ring-[#3370FF]/10 transition-all">
            <Search className="w-3.5 h-3.5 text-[#BBBFC4] flex-shrink-0" />
            <input
              type="text"
              placeholder="搜索文档"
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

      {/* Document list */}
      <div className="flex-1 min-h-0 overflow-y-auto px-1 pb-2">
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-[#3370FF] border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-[13px] text-[#8F959E]">加载中...</p>
          </div>
        )}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-[13px] text-[#F54A45]">{error}</p>
            <button onClick={loadDocuments} className="mt-2 text-[12px] text-[#3370FF] hover:underline">重试</button>
          </div>
        )}
        {!loading && !error && fileNodes.length > 0 ? fileNodes.map(node => (
          <TreeItem
            key={node.id}
            node={node}
            selectedId={selectedNodeId}
            onSelect={onSelectNode}
            onDownload={handleDownload}
            onDelete={setDeleteDoc}
          />
        )) : (
          !loading && !error && (
            <div className="flex flex-col items-center justify-center py-16">
              <BookOpen className="w-10 h-10 text-[#DEE0E3] mb-3" />
              <p className="text-[13px] text-[#8F959E]">{searchQuery ? '未找到匹配的文档' : '暂无文档'}</p>
              {!searchQuery && <p className="text-[11px] text-[#BBBFC4] mt-1">点击上传按钮添加文件</p>}
            </div>
          )
        )}
      </div>

      <UploadDocumentDialog open={uploadOpen} datasetId={deptPath} onClose={() => setUploadOpen(false)} onUploaded={handleUploaded} />
      <EditDatasetDialog key={datasetInfo?.id || 'new'} open={editOpen} dataset={datasetInfo} onClose={() => setEditOpen(false)} onSave={handleUpdateDataset} />
      <DeleteConfirmDialog open={deleteDatasetOpen} onClose={() => setDeleteDatasetOpen(false)} onConfirm={handleDeleteDataset} itemName={datasetInfo?.name || '当前知识库'} />
      <DeleteConfirmDialog open={!!deleteDoc} onClose={() => setDeleteDoc(null)} onConfirm={handleDeleteDocument} itemName={deleteDoc?.name || '该文档'} />
    </div>
  );
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
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
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
  const [datasetInfo, setDatasetInfo] = useState<BffDataset | null>(null);
  const [content, setContent] = useState('# 暂无内容\n\n该文件暂无预览内容。');
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [officeHtml, setOfficeHtml] = useState<string | null>(null);
  const [officeError, setOfficeError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    bffService.knowledge.listDatasets()
      .then(list => setDatasetInfo(list.find(d => d.id === deptPath) || null))
      .catch(() => setDatasetInfo(null));
  }, [deptPath]);

  useEffect(() => {
    if (!file?.documentId) return;
    let cancelled = false;
    let currentUrl: string | null = null;
    /* eslint-disable react-hooks/set-state-in-effect -- sync loading state for file preview */
    setLoading(true);
    setOfficeHtml(null);
    setOfficeError(null);
    bffService.knowledge.downloadDocument(deptPath, file.documentId)
      .then(async blob => {
        currentUrl = URL.createObjectURL(blob);
        if (!cancelled) setFileUrl(currentUrl);

        const name = file.name || '';
        if (isDocxFile(name)) {
          const html = await convertDocxToHtml(blob);
          if (!cancelled) setOfficeHtml(html || '<p>文档内容为空</p>');
        } else if (isXlsxFile(name)) {
          const html = await convertXlsxToHtml(blob);
          if (!cancelled) setOfficeHtml(html || '<p>表格内容为空</p>');
        } else if (isPptxFile(name)) {
          const text = await convertPptxToText(blob);
          if (!cancelled) setContent(text || 'PPT 内容为空');
        } else {
          const text = await blob.text();
          if (!cancelled) setContent(text || '# 空文件\n\n该文件没有内容。');
        }
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('[KnowledgeBase] preview conversion failed:', err);
        setOfficeError('文件预览转换失败，请尝试下载查看');
        setContent('# 加载失败\n\n无法读取文件内容。');
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => {
      cancelled = true;
      if (currentUrl) URL.revokeObjectURL(currentUrl);
    };
  }, [file, deptPath]);

  if (!deptPath) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-[#8F959E] bg-[#F5F6F7]">
        <BookOpen className="w-12 h-12 text-[#DEE0E3] mb-3" />
        <p className="text-[14px]">请在左侧选择一个知识库</p>
      </div>
    );
  }

  const handleDownload = async () => {
    if (!file?.documentId) return;
    const blob = await bffService.knowledge.downloadDocument(deptPath, file.documentId);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  };

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
          <button onClick={handleDownload} className="w-7 h-7 flex items-center justify-center rounded-md text-[#BBBFC4] hover:text-[#3370FF] hover:bg-[#E8F1FF] transition-colors" title="下载">
            <Download className="w-4 h-4" />
          </button>
          <button className="w-7 h-7 flex items-center justify-center rounded-md text-[#BBBFC4] hover:text-[#1F2329] hover:bg-[#F2F3F5] transition-colors">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-2 border-[#3370FF] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <FilePreview file={file} datasetName={datasetInfo?.name || deptPath} content={content} fileUrl={fileUrl} officeHtml={officeHtml} officeError={officeError} />
        )}
        <RetrievalTestPanel datasetId={deptPath} />
      </div>
    </div>
  );
}
