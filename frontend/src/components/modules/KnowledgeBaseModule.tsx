import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
  Folder, FileText, ChevronRight, ChevronDown, Trash2, BookOpen, Upload, X,
  Pencil, Search, MoreHorizontal, Download
} from 'lucide-react';
import * as XLSX from 'xlsx';
import * as jschardet from 'jschardet';
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

function getFileExtension(name: string): string {
  const i = name.lastIndexOf('.');
  return i >= 0 ? name.slice(i + 1).toLowerCase() : '';
}

function bytesToBinaryString(bytes: Uint8Array): string {
  const len = bytes.length;
  const chunk = 32768;
  let s = '';
  for (let i = 0; i < len; i += chunk) {
    s += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, Math.min(i + chunk, len))));
  }
  return s;
}

function normalizeEncodingName(encoding: string): string {
  const map: Record<string, string> = {
    'ascii': 'utf-8',
    'utf-8': 'utf-8',
    'utf8': 'utf-8',
    'gbk': 'gbk',
    'gb2312': 'gbk',
    'gb18030': 'gb18030',
    'big5': 'big5',
    'shift_jis': 'shift_jis',
    'shift-jis': 'shift_jis',
    'euc-jp': 'euc-jp',
    'euc-kr': 'euc-kr',
    'iso-8859-1': 'iso-8859-1',
    'windows-1252': 'windows-1252',
    'windows-1251': 'windows-1251',
  };
  return map[encoding.toLowerCase()] || encoding;
}

function decodeTextBuffer(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  // UTF-8 BOM
  if (bytes.length >= 3 && bytes[0] === 0xEF && bytes[1] === 0xBB && bytes[2] === 0xBF) {
    return new TextDecoder('utf-8').decode(bytes.slice(3));
  }
  const detected = jschardet.detect(bytesToBinaryString(bytes));
  const encoding = detected && detected.confidence > 0.5 ? normalizeEncodingName(detected.encoding) : 'utf-8';
  try {
    return new TextDecoder(encoding, { fatal: false }).decode(bytes);
  } catch {
    return new TextDecoder('utf-8', { fatal: false }).decode(bytes);
  }
}

function csvToMarkdown(text: string): string {
  const lines = text.split(/\r?\n/).filter(l => l.trim() !== '');
  if (lines.length === 0) return '# 空文件\n\n该文件没有内容。';
  const parseLine = (line: string): string[] => {
    const cells: string[] = [];
    let cell = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      const next = line[i + 1];
      if (inQuotes) {
        if (ch === '"') {
          if (next === '"') { cell += '"'; i++; }
          else { inQuotes = false; }
        } else {
          cell += ch;
        }
      } else {
        if (ch === '"') { inQuotes = true; }
        else if (ch === ',') { cells.push(cell.trim()); cell = ''; }
        else { cell += ch; }
      }
    }
    cells.push(cell.trim());
    return cells;
  };
  const rows = lines.map(parseLine);
  const maxCols = Math.max(...rows.map(r => r.length));
  const pad = (r: string[]) => [...r, ...Array.from({ length: maxCols - r.length }, () => '')];
  const padded = rows.map(pad);
  const md = [padded[0].join(' | ')];
  md.push(padded[0].map(() => '---').join(' | '));
  for (const row of padded.slice(1)) {
    md.push(row.map(c => c || ' ').join(' | '));
  }
  return md.join('\n');
}

function parseXlsxToMarkdown(buffer: ArrayBuffer): string {
  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.read(new Uint8Array(buffer), { type: 'array', cellFormula: false });
  } catch {
    return '# 无法解析 Excel 文件\n\n请尝试下载后使用本地软件打开。';
  }
  if (!workbook.SheetNames.length) {
    return '# 空表格\n\n该 Excel 文件没有工作表。';
  }
  const parts: string[] = [];
  for (const sheetName of workbook.SheetNames) {
    const ws = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: '' });
    if (rows.length === 0) continue;
    const maxCols = Math.max(...rows.map(r => (r as unknown[]).length));
    const pad = (r: unknown[]) => [...r, ...Array.from({ length: maxCols - r.length }, () => '')];
    const padded = rows.map(pad);
    if (workbook.SheetNames.length > 1) {
      parts.push(`## ${sheetName}`);
    }
    const head = padded[0].map(c => String(c ?? '').trim() || ' ');
    parts.push(head.join(' | '));
    parts.push(head.map(() => '---').join(' | '));
    for (const row of padded.slice(1)) {
      parts.push(row.map(c => String(c ?? '').trim() || ' ').join(' | '));
    }
  }
  return parts.length ? parts.join('\n') : '# 空表格\n\n该 Excel 文件没有可预览内容。';
}

async function parseDocxToText(buffer: ArrayBuffer): Promise<string> {
  try {
    const mammoth = await import('mammoth');
    const result = await mammoth.extractRawText({ arrayBuffer: buffer });
    return result.value.trim() || '# 空文件\n\n该 Word 文档没有可提取文本。';
  } catch {
    return '# 无法解析 Word 文档\n\n请尝试下载后使用本地软件打开。';
  }
}

async function parsePdfToText(buffer: ArrayBuffer): Promise<string> {
  try {
    const pdfjsLib = await import('pdfjs-dist');
    const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
    const pages: string[] = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const items = content.items as { str?: string }[];
      const text = items.map(item => item.str || '').join(' ').trim();
      if (text) pages.push(`--- 第 ${i} 页 ---\n${text}`);
    }
    return pages.length ? pages.join('\n\n') : '# 空文件\n\n该 PDF 没有可提取文本。';
  } catch {
    return '# 无法解析 PDF 文件\n\n请尝试下载后使用本地软件打开。';
  }
}

function looksBinary(name: string): boolean {
  const binaryExts = new Set(['doc', 'ppt', 'pptx', 'zip', 'rar', '7z', 'tar', 'gz', 'exe', 'dmg', 'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'mp3', 'mp4', 'avi', 'mov']);
  return binaryExts.has(getFileExtension(name));
}

async function blobToPreviewContent(blob: Blob, name: string): Promise<string> {
  const ext = getFileExtension(name);
  const buffer = await blob.arrayBuffer();
  if (ext === 'xlsx' || ext === 'xls') {
    return parseXlsxToMarkdown(buffer);
  }
  if (ext === 'docx') {
    return parseDocxToText(buffer);
  }
  if (ext === 'pdf') {
    return parsePdfToText(buffer);
  }
  if (ext === 'csv') {
    const text = decodeTextBuffer(buffer);
    return csvToMarkdown(text);
  }
  const textExts = new Set(['txt', 'md', 'markdown', 'json', 'js', 'ts', 'jsx', 'tsx', 'css', 'html', 'htm', 'xml', 'yaml', 'yml', 'log', 'conf', 'ini', 'sh', 'py', 'java', 'go', 'sql']);
  if (textExts.has(ext) || !looksBinary(name)) {
    const text = decodeTextBuffer(buffer);
    if (!text || text.trim().length === 0) return '# 空文件\n\n该文件没有内容。';
    return text;
  }
  return `# 暂不支持在线预览\n\n文件 **${name}** 为二进制格式，请下载后使用本地软件打开。`;
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
          {node.statusText || node.status}
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

function FilePreview({ file, datasetName, content }: { file: FileNode; datasetName: string; content: string }) {
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
      if (t.includes('|')) {
        const raw = line.split('|');
        const cells = raw.slice(raw[0].trim() === '' ? 1 : 0, raw[raw.length - 1].trim() === '' ? -1 : undefined).map(c => c.trim());
        if (cells.length > 0 && !cells.every(c => /^-+$/.test(c))) tableRows.push(cells);
        inTable = true;
        return;
      }
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
      <div className="flex items-center gap-1.5 text-[11px] text-[#BBBFC4] mb-6 flex-wrap">
        <span>{datasetName}</span>
        <ChevronRight className="w-2.5 h-2.5" />
        <span className="text-[#3370FF] font-medium">{file.name}</span>
      </div>
      <div className="bg-white rounded-xl p-8 border border-[#DEE0E3] shadow-sm">{renderContent(content)}</div>
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
    <div className="flex flex-col flex-1 min-h-0 bg-[#F5F6F7]">
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

// ===== Retrieval Test Panel (暂时隐藏) =====
/*
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
*/

// ===== Feishu-style Right Panel =====

export function KnowledgeBaseRightPanel({ file, deptPath }: { file: FileNode | null; deptPath: string }) {
  const [datasetInfo, setDatasetInfo] = useState<BffDataset | null>(null);
  const [content, setContent] = useState('# 暂无内容\n\n该文件暂无预览内容。');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    bffService.knowledge.listDatasets()
      .then(list => setDatasetInfo(list.find(d => d.id === deptPath) || null))
      .catch(() => setDatasetInfo(null));
  }, [deptPath]);

  useEffect(() => {
    if (!file?.documentId) return;
    let cancelled = false;
    /* eslint-disable react-hooks/set-state-in-effect -- sync loading state for file preview */
    setLoading(true);
    bffService.knowledge.downloadDocument(deptPath, file.documentId)
      .then(blob => blobToPreviewContent(blob, file.name))
      .then(text => { if (!cancelled) setContent(text || '# 空文件\n\n该文件没有内容。'); })
      .catch(() => { if (!cancelled) setContent('# 加载失败\n\n无法读取文件内容。'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
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
          <FilePreview file={file} datasetName={datasetInfo?.name || deptPath} content={content} />
        )}
        {/* <RetrievalTestPanel datasetId={deptPath} /> */}
      </div>
    </div>
  );
}
