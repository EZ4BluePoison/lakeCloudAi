# 知识库后端接口接入设计文档

## 背景
当前前端知识库模块使用 `knowledgeBaseData` 和 `bffService.knowledge` 的 mock 实现。现在后端已提供真实的控制台知识库接口，需要把前端数据层替换为真实 API。

## 目标
- 使用图中提供的后端接口替换 mock 数据。
- 保持左侧组织架构不变，每个组织节点对应一个 dataset。
- 首次进入无 dataset 的节点时自动创建空白 dataset。
- 支持列出 dataset、创建 dataset、上传文件、列出文档、下载文档、删除/更新 dataset 和文档。

## 接口基地址与认证
- 基地址：`http://localhost:8080`
- 无需认证，直接 `fetch`，不带 token。
- 响应为标准 JSON 数组/对象。

## 组织节点与 dataset 映射
- dataset ID = 组织节点 id（如 `taihu-sales`）。
- dataset 名称 = 组织节点名称（如 `市场销售中心`）。
- 描述字段可选，初始为空字符串。

## 首次加载流程
1. 用户点击左侧某个组织节点。
2. 调用 `GET /api/console/knowledge/datasets/{datasetId}/documents`。
3. 若接口返回 404 或明确表示 dataset 不存在：
   - 调用 `POST /api/console/knowledge/datasets` 创建空白 dataset，body `{ name, description: '' }`。
   - 创建成功后再次调用文档列表接口。
4. 将后端返回的文档列表映射为 `FileNode[]` 渲染。

## Service 层接口
在 `frontend/src/services/bffService.ts` 中扩展 `BffKnowledgeService`：

```ts
async listDatasets(): Promise<BffDataset[]>
async createDataset(payload: { name: string; description?: string }): Promise<BffDataset>
async listDocuments(datasetId: string): Promise<BffDocument[]>
async uploadDocument(datasetId: string, file: File): Promise<BffDocument>
async deleteDocument(datasetId: string, documentId: string): Promise<void>
async updateDocument(datasetId: string, documentId: string, payload: Partial<BffDocument>): Promise<BffDocument>
async deleteDataset(datasetId: string): Promise<void>
async updateDataset(datasetId: string, payload: Partial<BffDataset>): Promise<BffDataset>
async downloadDocument(datasetId: string, documentId: string): Promise<Blob>
```

## UI 层调整
- `KnowledgeBaseModule` 移除 `knowledgeBaseData` mock 导入。
- 使用 `useEffect` 监听 `deptPath` 变化，加载文档列表并自动创建 dataset。
- 上传文件时读取 `File` 并通过 `FormData` 提交。
- 文档列表按 `FileNode` 渲染，显示名称、大小、状态、更新时间。
- 文件操作区增加“下载”按钮。
- dataset 操作区增加“编辑信息”和“删除知识库”按钮。
- 保留本地文件夹的增删改（作为前端视图分组，不强制同步后端）。

## 类型
- 复用 `frontend/src/data/mockBffData.ts` 中的 `BffDataset`、`BffDocument`。
- 必要时扩展 `BffDataset.description` 字段。

## 验证标准
- `npm run lint` / `npx tsc -b` / `npm run build` 通过。
- 启动后端后，进入知识库模块，选择任意部门节点，能自动创建 dataset 并显示文档列表。
- 上传文件后文档出现在列表中。
- 点击下载可获取文件内容。
