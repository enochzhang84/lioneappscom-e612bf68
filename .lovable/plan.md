## 目标
在 `/admin` 新增「页面管理」模块，可创建、编辑、排序、启停自定义前台页面（如「实用工具」）。前台导航栏根据数据库动态渲染，现有固定页面（首页/产品/案例/关于/联系）保持不变。

## 一、数据库（新迁移）

新增两张表：

**pages**
- `id uuid PK`
- `slug text unique`（例如 `tools`，前台路径 `/p/{slug}`）
- `title text`（页面标题）
- `nav_label text`（导航栏显示文字）
- `page_type text`（`content` | `tools` | `blank`）
- `content jsonb`（区块数组：标题/副标题/文字/图片/按钮/HTML/工具卡片）
- `show_in_nav bool default true`
- `is_visible bool default true`（停用 = false）
- `sort_order int default 0`
- `created_at`, `updated_at`

RLS：`anon` 只读 `is_visible=true`；admin 全权。GRANT 齐全。

## 二、前台路由

新增单一动态路由 `src/routes/p.$slug.tsx`：
- 从 pages 表按 slug 读取
- 根据 `page_type` 渲染：
  - `content`: 区块顺序渲染（title/subtitle/text/image/button/html）
  - `tools`: 工具卡片网格（卡片带图标、标题、描述、链接）
  - `blank`: 只渲染自定义 HTML 块

不影响现有 `/`, `/products/$slug`, `/cases`, `/about`, `/contact`。

导航栏（`SiteLayout`）改造：
- 保留原有固定项（首页/产品/案例/关于/联系）
- 追加数据库中 `show_in_nav=true && is_visible=true` 的 pages（按 sort_order）
- 通过一个轻量 public server fn `listNavPages()` 提供数据

## 三、后台

**菜单**：在 `admin.tsx` 侧边导航加入「页面管理」，位置为「案例」和「站点设置」之间。

**路由**：
- `src/routes/_authenticated/admin.pages.tsx`（layout：Outlet）
- `admin.pages.index.tsx` — 列表 + 「+ 新增页面」
  - 表格列：页面名称 | slug | 导航栏显示 | 状态 | 排序 | 操作
  - 操作：编辑 / 删除 / 启停 / 上下移
- `admin.pages.$id.tsx` — 编辑器
  - 基本信息：title, slug, nav_label, sort_order, show_in_nav, page_type
  - 区块编辑器（content JSON 数组）：可添加/删除/排序区块，每种类型独立表单
  - 工具卡片：图标（emoji/icon 名）、标题、描述、链接 URL

**Server fns**（`src/lib/pages-admin.functions.ts`）：`adminListPages`, `adminGetPage`, `adminUpsertPage`, `adminDeletePage`, `adminTogglePageVisibility`, `adminMovePage`。全部带 `requireSupabaseAuth` + 管理员校验。

**Public fn**（`src/lib/cms.functions.ts` 追加）：`listNavPages()`（只返 slug/nav_label/sort_order），`getPageBySlug(slug)`。

## 四、区块类型 Schema

```ts
type Block =
  | { type: 'title'; text: string }
  | { type: 'subtitle'; text: string }
  | { type: 'text'; text: string }
  | { type: 'image'; url: string; alt?: string }
  | { type: 'button'; label: string; href: string }
  | { type: 'html'; html: string }
  | { type: 'tool_card'; icon?: string; title: string; desc?: string; href: string }
```

## 五、不影响现有

- 现有路由文件全部不动
- 导航栏采用「固定项 + 追加动态项」策略
- 前台通过 `/p/{slug}` 命名空间，避免与现有路由冲突

## 六、交付顺序

1. 迁移建表 + RLS + GRANT
2. Admin server fns + 后台列表/编辑页 + 菜单项
3. 前台动态路由 `/p/$slug` + 导航栏动态追加
4. 顺手清理构建报错的 `admin.pages` 引用（若有）与孤立的 `reset-admin-pw.ts` 引用

完成后你可在 `/admin/pages` 新建「实用工具」页面（slug=`tools`, 类型=tools，勾选显示在导航），前台导航即自动出现「实用工具」，点击进入 `/p/tools`。
