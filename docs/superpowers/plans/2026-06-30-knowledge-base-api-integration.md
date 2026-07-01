# 知识库后端接口接入实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将前端知识库模块从 mock 数据切换到后端真实 API。

**Architecture:** 左侧组织节点一一映射为 dataset；Service 层使用原生 `fetch` 调用 `http://localhost:8080/api/console/knowledge/*`；UI 层按 dataset 加载文档并自动创建缺失的 dataset。

**Tech Stack:** React + TypeScript + fetch + shadcn/ui

---

### Task 1: Service 层改造

**Files:**
- Modify: `frontend/src/services/bffService.ts`

- [ ] **Step 1: 添加基地址常量**

```ts
const API_BASE_URL = 'http://localhost:8080';
```

- [ ] **Step 2: 扩展 `BffKnowledgeService`**

实现 `listDatasets`、`createDataset`、`listDocuments`、`uploadDocument`、`deleteDocument`、`updateDocument`、`deleteDataset`、`updateDataset`、`downloadDocument`。

- [ ] **Step 3: 提交**

```bash
git add frontend/src/services/bffService.ts
git commit -m "feat(service): implement real knowledge base API client"
```

---

### Task 2: 类型补充

**Files:**
- Modify: `frontend/src/data/mockBffData.ts`

- [ ] **Step 1: 给 `BffDataset` 添加可选 `description`**

```ts
export interface BffDataset {
  id: string;
  name: string;
  description?: string;
  documentCount: number;
  createdAt: string;
  updatedAt: string;
}
```

- [ ] **Step 2: 提交**

```bash
git add frontend/src/data/mockBffData.ts
git commit -m "types: add optional description to BffDataset"
```

---

### Task 3: 知识库 UI 接入真实数据

**Files:**
- Modify: `frontend/src/components/modules/KnowledgeBaseModule.tsx`
- Modify: `frontend/src/data/agents.ts`

- [ ] **Step 1: 移除 `knowledgeBaseData` 导入和使用**

`KnowledgeBaseModule` 不再从 `agents.ts` 导入 `knowledgeBaseData`，改用 API 加载。

- [ ] **Step 2: 添加 dataset/文档状态**

```ts
const [documents, setDocuments] = useState<BffDocument[]>([]);
const [datasetInfo, setDatasetInfo] = useState<BffDataset | null>(null);
const [loading, setLoading] = useState(false);
```

- [ ] **Step 3: 实现自动加载/创建 dataset**

在 `useEffect` 中监听 `deptPath`：

```ts
useEffect(() => {
  async function load() {
    setLoading(true);
    try {
      const docs = await bffService.knowledge.listDocuments(deptPath);
      setDocuments(docs);
    } catch (err: any) {
      if (err?.status === 404 || err?.message?.includes('404')) {
        const dataset = await bffService.knowledge.createDataset({ name: resolveName(deptPath), description: '' });
        setDatasetInfo(dataset);
        const docs = await bffService.knowledge.listDocuments(deptPath);
        setDocuments(docs);
      }
    } finally {
      setLoading(false);
    }
  }
  load();
}, [deptPath]);
```

- [ ] **Step 4: 将 `BffDocument[]` 映射为 `FileNode[]` 渲染**

```ts
const fileTree: FileNode[] = useMemo(() => {
  return documents.map(doc => ({
    id: doc.id,
    name: doc.name,
    type: 'file',
    size: doc.size,
    modifiedAt: doc.updatedAt,
    permission: 'group',
    status: doc.status,
    statusText: doc.statusText,
    documentId: doc.id,
  }));
}, [documents]);
```

- [ ] **Step 5: 上传、下载、删除文档**

- 上传：调用 `uploadDocument`，成功后刷新文档列表。
- 下载：调用 `downloadDocument` 生成 Blob URL 触发下载。
- 删除：调用 `deleteDocument`，成功后刷新列表。

- [ ] **Step 6: 删除/编辑 dataset**

- 工具栏增加“删除知识库”和“编辑信息”按钮。
- 删除后清空右侧并提示用户。
- 编辑信息调用 `updateDataset`。

- [ ] **Step 7: 提交**

```bash
git add frontend/src/components/modules/KnowledgeBaseModule.tsx frontend/src/data/agents.ts
git commit -m "feat(knowledge-base): integrate real dataset and document APIs"
```

---

### Task 4: 清理 mock 数据

**Files:**
- Modify: `frontend/src/data/agents.ts`

- [ ] **Step 1: 删除 `sampleDataset` 辅助函数和 `knowledgeBaseData` 导出**

保留 `knowledgeOrgTree`，删除文件树 mock。

- [ ] **Step 2: 提交**

```bash
git add frontend/src/data/agents.ts
git commit -m "chore(data): remove knowledge base mock file trees"
```

---

### Task 5: 构建验证

- [ ] **Step 1: lint**

```bash
cd frontend && npm run lint
```

- [ ] **Step 2: 类型检查**

```bash
npx tsc -b
```

- [ ] **Step 3: 生产构建**

```bash
npm run build
```

- [ ] **Step 4: 推送**

```bash
git push origin version1.001
```

---

## 验证标准
- 选择部门节点后能自动创建 dataset 并加载文档列表。
- 上传文件后文件出现在列表中。
- 下载按钮可下载文件。
- 删除 dataset 后右侧清空。
- `lint`、`tsc`、`build` 全部通过。
