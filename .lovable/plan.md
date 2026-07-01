
# 页面管理优化：工具页面左右布局 + 分类/内容管理

## 一、数据库（新增两张表）

新增 `tool_categories`（项目栏）和 `tool_items`（内容栏），通过 `page_id` 关联到 `pages` 表中 `page_type='tools'` 的页面。

**tool_categories 字段**
- id, page_id (FK pages), title, description, icon, sort_order, is_visible, timestamps
- 唯一约束: (page_id, slug) 可选，先用 id 引用

**tool_items 字段**
- id, page_id, category_id (FK tool_categories, on delete cascade), title, description, content(text), image_url, video_url, link_url, button_text, slug (用于详情页 URL), sort_order, is_visible, timestamps

**RLS/GRANT**
- 匿名 SELECT 可见行（is_visible=true）
- authenticated 全部（admin 通过 has_role 校验）+ service_role
- 遵循 GRANT 规范

## 二、后端 server functions

新增 `src/lib/tools-admin.functions.ts`：
- adminListCategories({ page_id })
- adminUpsertCategory / adminDeleteCategory / adminMoveCategory / adminToggleCategoryVisibility
- adminListItems({ page_id }) 一次拉全（含 category_id）
- adminUpsertItem / adminDeleteItem / adminMoveItem / adminToggleItemVisibility

在 `src/lib/cms.functions.ts` 中新增公开读取：
- getToolsByPageSlug({ slug }) → 返回 { page, categories, items }
- getToolItem({ pageSlug, itemSlug }) → 详情页数据

## 三、后台编辑器（admin.pages.$id.tsx）

在页面类型为 `tools` 时，在"页面内容"卡片下方增加一个新卡片 **"工具页面分类与内容"**（仅 tools 类型显示），提供两个 Tab / 两个区域：

- **项目栏 (Categories)**：列表 + `+ 添加项目栏`
  - 每行可展开编辑：标题、说明、emoji、排序、显示开关、删除
- **内容栏 (Items)**：列表 + `+ 添加内容栏`
  - 每行可编辑：所属项目栏（下拉）、标题、简介、正文（Textarea）、图片(ImageUpload)、视频链接、外部/内部链接、按钮文字、slug、排序、显示

顶部"页面内容"工具栏中额外加两个快捷按钮 `+ 添加项目栏` / `+ 添加内容栏`（tools 类型时可用），点击直接在下方分类/内容区新增一行。

普通 `content` 与 `blank` 页面完全不显示这个卡片，保持现有行为不受影响。

## 四、前台

### `/p/{slug}` （page_type = tools）
改为左右布局：
- 桌面：`grid-cols-[240px_1fr]`，左侧 sticky 分类列表，图标 + 标题
- 移动端：上下布局，分类变成横向可滚动 chip
- 选中态用 URL search param `?cat=<categoryId>` 或本地 state；默认选第一个
- 右侧显示所选分类的 items 卡片列表（标题、简介、按钮/链接）
- 点击 item：若 link_url 非空则跳转该地址；否则进入内置详情页 `/p/{slug}/i/{itemSlug}`

`content` / `blank` 类型保持现有渲染逻辑不变。

### 详情页：新增 `src/routes/p.$slug.i.$itemSlug.tsx`
博客文章样式：
- 返回按钮 → `/p/{slug}`
- 标题、发布时间（created_at）、所属分类 badge
- 正文（whitespace-pre-wrap）
- 图片、视频（iframe 或 video 标签）
- 相关链接按钮（link_url + button_text）

## 五、导航栏不受影响

`SiteLayout` 已根据 pages.show_in_nav 动态渲染，无需改动。

## 六、风格

沿用现有 shadcn + tailwind 语义 token，卡片 border/bg-card，hover:border-primary/40，简洁知识库风格。

## 技术要点
- 迁移工具建表（含 GRANT + RLS + updated_at 触发器复用 `set_updated_at`）
- 类型：迁移执行后 Supabase types 会重新生成，随后再写依赖类型的代码
- 详情页路由：`p.$slug.i.$itemSlug.tsx` 走 loader `ensureQueryData` + `useSuspenseQuery` 模式（保持与现有 p.$slug 一致）
- 后台使用 react-query mutation + invalidate 刷新列表

## 交付顺序
1. 数据库迁移（等用户确认）
2. 后端 server functions（admin + public）
3. 后台编辑器 UI（tools 类型专属卡片）
4. 前台 `/p/{slug}` 左右布局改造
5. 详情页新路由

确认后开始执行第 1 步（迁移）。
