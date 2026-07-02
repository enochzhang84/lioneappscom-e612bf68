
# Lione Apps 后台 CMS 升级方案

这是一次架构级重构，不是单次改动就能完成。建议**分 5 期迭代**，每期都能独立上线并可用，避免一次性大改导致现有 DMV/工具页面中断。

## 总体架构原则

- **数据驱动**：所有页面、工具、题库、SEO、导航都存数据库，前台从 DB 读取，新增工具无需改代码。
- **统一列表体验**：所有列表复用一个 `<DataTable>` 通用组件（搜索、排序、分页、批量启用/禁用/删除、状态标签）。
- **统一后台外壳**：左侧固定侧边栏 + 顶部面包屑，所有模块共用 `AdminShell` 布局（现代 Dashboard 风格）。
- **权限隔离**：所有 CMS 操作走 `createServerFn` + `requireSupabaseAuth` + `has_role('admin')`，只读列表可后续扩展 editor 角色。
- **可扩展工具注册表**：前台 `EMBEDDED_APPS` 保留，但工具的分类/层级/顺序/SEO 全由后台驱动。

---

## 第 1 期 · 后台外壳统一 + 通用列表组件（基础设施）

目的：让后续所有新模块都能"照抄"同一套 UI。

**新增文件**
- `src/components/admin/AdminShell.tsx` — 左侧菜单（12 项，与需求一致，未实现的模块显示"即将上线"占位）+ 顶部面包屑 + 用户菜单
- `src/components/admin/DataTable.tsx` — 通用列表（搜索框、列排序、分页、批量选择、批量操作栏）
- `src/components/admin/PageHeader.tsx` — 统一页头（标题 + 操作按钮）
- `src/components/admin/StatusBadge.tsx`, `SortableRow.tsx`, `ConfirmDialog.tsx`

**改造**
- 现有 `admin.*.tsx` 全部改用 `AdminShell`，菜单结构改为 12 大类
- 现有"页面管理""工具管理""题库管理"改用 `DataTable`（保留现有功能）

**产出**：外壳统一，占位菜单可点开，为后续 4 期铺路。

---

## 第 2 期 · 工具管理 + 题库管理正式树状化

**工具管理**
- 复用现有 `tool_items.parent_id`，扩展为**无限层级**（当前是三层，改为递归树）
- 后台 UI：左侧树（可拖拽排序、展开折叠）+ 右侧详情
- 新增字段：`icon`（Lucide 名字或图片 URL）、`badge`、`seo_title`、`seo_description`、`seo_keywords`、`is_hidden_from_nav`
- 前台 `/p/tools` 自动按树递归渲染，无需针对"驾照宝典"硬编码

**题库管理**
- 现有 `quiz_questions` 增加 `exam_id`（外键到新表 `quiz_exams`）
- 新表 `quiz_exams`：一个"考试"= 一套抽题规则（category、total、pass、seconds、bilingual、handbook_url）
- 后台：考试列表 → 进入某考试 → 题目列表（DataTable + 批量导入 CSV / JSON）
- 前台 `QuizApp` 改为**只传 `exam_id`**，规则从 DB 读取（去掉当前 `p.$slug.i.$itemSlug.tsx` 里的硬编码 PROPS 表）

**产出**：以后新增任何考试（如"摩托车 M1"），只需后台建考试 + 导入题库 + 新建工具项，前台零代码。

---

## 第 3 期 · 页面管理 + SEO 中心 + 文件管理

**页面管理**
- 现有 `pages` 表扩展：`body_json`（块编辑器 JSON）、`show_in_nav`、`nav_order`、`parent_id`
- 后台：所见即所得块编辑器（标题块、富文本块、图片块、卡片组块、CTA 块）
- 前台路由 `/$slug` 通用渲染器读取 blocks 并渲染
- 导航栏自动读取 `show_in_nav = true` 的页面

**SEO 中心**
- 新表 `seo_settings`：per-page `path`, `title`, `description`, `keywords`, `og_image`, `canonical`, `robots`
- `__root.tsx` / 各路由 `head()` 优先读取 SEO 表
- 后台：全站 SEO 列表 + `/sitemap.xml` 自动生成 + `robots.txt` 编辑
- 集成 Google Search Console 收录状态查询（复用已有 GSC connector）

**文件管理**
- 用现有 `site-media` bucket
- 后台：网格视图、上传、按类型筛选（图片/PDF/视频/文档）、复制 URL
- 页面块 / 工具图标 / 文章封面均从这里选

**产出**：非技术用户可以自己建页面、改 SEO、传文件。

---

## 第 4 期 · 文章中心 + 用户中心 + 网站运营中心

**文章中心（博客）**
- 新表：`blog_categories`, `blog_tags`, `blog_posts`, `blog_post_tags`
- 前台：`/blog`, `/blog/$slug`, `/blog/category/$slug`, `/blog/tag/$slug`
- Markdown/富文本编辑、封面图、相关文章、自动 JSON-LD Article

**用户中心**
- 新表：`user_favorites`（收藏工具）、`quiz_attempts`（考试记录）、`quiz_wrong_answers`（错题本）、`recent_tools`
- 前台：`/me` 用户中心（登录用户）
- 后台：会员列表、封禁、查看使用情况

**网站运营中心**
- 新表 `analytics_events`（page_view、tool_use、exam_submit）
- 客户端埋点 `useAnalytics` hook + 后端聚合 server fn
- 后台仪表盘：今日/本月访问、热门工具 Top10、来源、地区、设备、浏览器、时段分布（Recharts）
- 集成 Google Search Console 数据

**产出**：可以做内容营销 + 会员运营 + 数据决策。

---

## 第 5 期 · 通知中心 + 日志中心 + 系统设置

**通知中心**
- 新表 `announcements`（后台公告，前台横幅）、`system_notifications`（管理员站内信）
- 版本更新日志页 `/changelog`

**操作日志**
- 新表 `admin_audit_log`：`admin_id`, `action`, `resource_type`, `resource_id`, `diff_json`, `ip`, `ua`, `created_at`
- 通用中间件 `withAuditLog` 包装所有写操作 server fn

**系统设置**
- 扩展 `site_settings`：logo、favicon、导航配置、页脚、联系方式、GA ID、GSC 验证、SMTP、默认语言、时区
- 后台分 Tab 编辑

**仪表盘（首页）**
- 综合看板：访问量卡片、待办（未审文章、待回复咨询）、系统健康、快捷入口

---

## 数据库改动汇总（分期迁移）

| 期 | 新表 | 主要字段扩展 |
|---|---|---|
| 2 | `quiz_exams` | `tool_items`: seo/icon/badge/hidden |
| 3 | `seo_settings` | `pages`: body_json/nav 相关 |
| 4 | `blog_categories/tags/posts/post_tags`, `user_favorites`, `quiz_attempts`, `quiz_wrong_answers`, `analytics_events` | — |
| 5 | `announcements`, `system_notifications`, `admin_audit_log` | `site_settings`: 大量新配置 |

所有新表遵循规范：`GRANT` + `RLS` + `has_role('admin')` 策略 + `updated_at` 触发器。

---

## 不改动 / 保留

- 现有 C1、空气制动、组合车辆、商业驾驶者考试 **URL 与考试逻辑保持不变**
- 现有 `/admin` 登录、admin 角色声明机制
- 抽题、判分、结果页 `ExamResultReview` 组件

---

## 建议启动方式

请确认以下问题后开始 **第 1 期**：

1. **是否接受分 5 期迭代**？（每期约 1-3 次对话完成）
2. **第 1 期先做外壳统一 + 通用列表组件**，可以吗？还是希望优先某个模块（如"网站运营中心"或"SEO 中心"）？
3. 用户中心是否需要**前台注册入口**？（当前只有 admin 一个用户，前台是否允许普通用户注册以启用收藏/错题本？）
4. 文章中心的编辑器优先级：**Markdown**（简单）还是**块编辑器**（所见即所得，工作量大）？

回复后我立即开始第 1 期。
