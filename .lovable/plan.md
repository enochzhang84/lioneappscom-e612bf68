# AI Knowledge Engine 平台化升级方案

将现有 DMV 专属的 AI 解析升级为平台级 AI 知识引擎，所有产品共享一套缓存 + 调用架构。

## 一、目标

- 建立统一 `ai_cache` 表 + 统一服务层，所有模块（DMV / Church / Estimate / Warehouse / Blog / Tool / Article）共用。
- **确定性内容**（题目解析、文章摘要、产品描述等）→ 缓存优先，命中直接返回，未命中才调 AI 并落库。
- **开放式对话**（Ask AI / AI 助手 / AI 写作 / AI 翻译）→ 保持实时调用，不走缓存。
- 后台新增 **AI 管理中心**：查看/搜索缓存、按模块批量生成、重新生成、删除、Token 统计、失败日志。
- 支持 Prompt 版本控制（v1/v2/v3）与多语言（zh / en / …）。

## 二、数据库改动（一次迁移）

### 1. 新增 `public.ai_cache`

字段：
- `id uuid pk`
- `module text`（dmv / church / estimate / warehouse / blog / tool / article …）
- `record_type text`（question / article / product …）
- `record_id text`（业务主键，例如 quiz_question uuid）
- `language text default 'zh'`
- `prompt_version text default 'v1'`
- `provider text`（google / openai / …）
- `model text`
- `request_hash text`（prompt + inputs 的 sha256，用于强一致命中）
- `ai_content jsonb`（结构化内容，DMV 用 7 段式）
- `status text default 'ready'`（ready / failed / generating）
- `error text null`
- `tokens_in int / tokens_out int / cost_credits numeric`
- `created_at / updated_at`

索引：
- `unique (module, record_type, record_id, language, prompt_version)`
- `index (module, status)`、`index (request_hash)`

RLS：
- `SELECT` 对 `authenticated` + `anon` 开放（缓存内容是产品知识，公开可读）。
- `INSERT/UPDATE/DELETE` 仅 `service_role`（只有服务端函数可写）+ admin 用户可通过后台操作。
- 完整 GRANT。

### 2. 新增 `public.ai_generation_jobs`（可选，用于批量任务追踪）

字段：`id, module, record_type, total, done, failed, status, created_by, created_at, updated_at`。RLS：仅 admin 可见。

（如果为了缩小范围，此表可放二期，先用同步分批生成。）

## 三、后端服务层

### `src/lib/ai-knowledge.functions.ts`（新）

统一 API，所有产品调用它，而不是直接调 Gemini：

- `getOrGenerateAiContent({ module, record_type, record_id, language, prompt_version, buildPrompt, inputs })`
  1. 按 `(module, record_type, record_id, language, prompt_version)` 查 `ai_cache`。
  2. 命中且 `status=ready` → 直接返回 `ai_content`（**不消耗 quota**）。
  3. 未命中 → 走 quota → 调 gateway（沿用 `runAiTool`）→ 写入 `ai_cache` → 返回。
  4. 失败 → 写入 `status=failed, error=...`，抛给调用方。

- `regenerateAiContent({ id })` / `deleteAiCache({ id })`：admin 专用（`has_role admin`）。
- `bulkGenerateAiContent({ module, record_type, ids, language, prompt_version })`：admin 专用，循环调 `getOrGenerateAiContent`，返回进度。
- `listAiCache({ module?, status?, search?, page })`：admin 后台列表。

所有写操作走 `requireSupabaseAuth` + `has_role('admin')`；读操作允许匿名（走 publishable client）。

### `src/lib/ai-quota.functions.ts`（改）

- **缓存命中不扣 quota**（由 `getOrGenerateAiContent` 决定何时调用 `consumeAiQuota`）。
- 保留现有 3 次/日免费额度，仅在真正调 AI 时扣。

## 四、DMV 接入改造

`src/routes/p.drive.c1.tsx`：

- `AiAnalysisSheet` 的 `useQuery` 从直接 `runAiTool` 改为调 `getOrGenerateAiContent`：
  - `module: "dmv"`, `record_type: "question"`, `record_id: r.id`, `language: "zh"`, `prompt_version: "v1"`。
  - `buildPrompt` 沿用现有 7 段式 prompt。
- 首次打开某题 → 调 AI 落库；之后所有用户打开同一题 → 直接读缓存，秒开、免费。
- Quota 逻辑保留：只有真正触发 AI 生成时才扣（第一次生成的那个用户）。
- 加一行 UI 提示："✨ 本题解析已缓存，免费查看"（命中时）。

## 五、后台 AI 管理中心

新路由 `src/routes/_authenticated/admin.ai.tsx`（或挂在现有 Platform Admin Sidebar 的新菜单 "AI 引擎"）：

Tab 结构：
1. **缓存列表**：DataTable（module / record_type / record_id / language / version / model / status / updated_at），支持筛选、搜索、单条重新生成、删除。
2. **批量生成**：选择 module + record_type（例如 DMV 笔试 244 题 / 图标 56 题），点 "生成全部" → 后端循环调，前端展示进度条。
3. **统计**：按 module 聚合缓存数、失败数、Token 用量、命中率（sum tokens_in/out from cache 表 + ai_usage_logs）。
4. **失败日志**：`status='failed'` 的记录，一键重试。

复用统一 UI：PageHeader / DataTable / ConfirmDialog / EmptyState。

## 六、其他模块（预留，不改动现有页面）

- Church / Estimate / Warehouse / Blog / Tool 现在不接入，但引擎已就绪。
- 文档新增 `docs/ai-knowledge-engine.md`：说明其它模块如何 3 行代码接入（`getOrGenerateAiContent(...)`）。

## 七、不影响的部分

- C1 笔试测试 / C1 图标测试 / 空气制动 / 组合车辆 / 商业驾驶者笔试：不动。
- 现有 `runAiTool`、`ai_usage_logs`、`ai_usage_daily`：保留。
- 开放式 AI 调用（若存在）：不接缓存。

## 八、上线步骤

1. 迁移：`ai_cache` 表 + RLS + GRANT。
2. 新增 `ai-knowledge.functions.ts`。
3. DMV 改为通过引擎读写。
4. 后台 AI 管理中心页面（列表 + 单条重新生成 + 批量生成 + 统计）。
5. 验证：Playwright 跑一遍 DMV 打开解析 → 首次生成 → 关闭重开秒返回、不扣 quota。

## 技术细节

- `request_hash = sha256(prompt_version || '|' || JSON.stringify(inputs))`，Prompt 或输入变更即视为新缓存键。
- 版本升级路径：改 prompt → 把 `prompt_version` 从 `v1` 升到 `v2`，老缓存自动失效但保留（可对比 / 回滚）。
- 多语言：`language` 字段是缓存键的一部分，同一题不同语言各存一份。
- 幂等：`ON CONFLICT (module, record_type, record_id, language, prompt_version) DO UPDATE`，避免并发重复插入。

---

确认后我按此执行（迁移 → 引擎 → DMV 接入 → 后台管理页）。如果想缩小首期范围（例如后台管理页只做"列表 + 单条重新生成"，批量生成放二期），告诉我即可。