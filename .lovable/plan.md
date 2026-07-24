# 博客系统升级方案

现状：`blog_posts` 表已存在（单语字段），前台 `/blog` 与 `/blog/$slug`、后台 `/admin/blog` 已搭好基础。但当前完全不支持中英双语，无分类/标签/评论/设置四张表，编辑器是纯 textarea，无搜索/分页/推荐/相关文章/SEO 结构化数据/RSS/sitemap/自动保存/预览/软删除/权限细分。

要把需求文档里的 26 节全部一次做完，工作量约等于重建一个小型 CMS。建议**分三阶段交付**，每阶段独立可用、可验收。本次请先确认走哪个阶段（默认建议 P1 立即开工）。

---

## P1 · 核心可用（本次立即实现）

目标：博客真正"能读能写能发布"，双语完整，SEO 达标，风格统一。

### 数据库迁移（一次性）
在现有 `blog_posts` 上扩展，**不删任何字段、不清数据**：
- 增加双语列：`title_zh/title_en, excerpt_zh/en, content_zh/en, cover_alt_zh/en, seo_title_zh/en, meta_description_zh/en`
- 增加运营列：`reading_time, og_image_url, deleted_at, scheduled_at, allow_comments`
- 迁移旧 `title/excerpt/content` → `*_zh`（保留原字段作兼容视图）
- 新增 `blog_categories`（双语 name/description、slug、sort_order、is_active）
- 新增 `blog_tags`（双语 name、slug）+ `blog_post_tags` 关联表
- `blog_posts.category_id` 外键指向 `blog_categories`
- 所有表：GRANT + RLS（公开 SELECT 已发布；管理员全权限，用 `has_role`）
- 种子 10 个默认分类（家庭网络/NAS/智能家居/…）
- 3 篇双语草稿示例（不发布）

### 前台 `/blog`（重写列表页）
- Hero：双语主副标题 + 现有科技风插图（复用 `services-hero-ecosystem.jpg`）
- 推荐区：`featured=true` 取 1 大 + 3 小；无则回退最新
- 分类胶囊筛选栏（`?category=slug`）
- 搜索框（`?q=`，防抖，按标题/摘要/正文/标签模糊匹配）
- 三列文章卡片（封面/分类/标题/摘要/日期/阅读时间/作者/CTA）
- 分页（`?page=`，每页 9）
- 空状态双语提示
- 底部咨询 CTA
- 完整 `head()` SEO（含 hreflang zh/en）

### 前台 `/blog/$slug`（重写详情页）
- 面包屑、分类、标题、摘要、作者、日期、阅读时间
- 封面图（16:10, lazy）
- 正文渲染（Markdown → HTML，用 `marked` + `DOMPurify`；P1 不上富文本，编辑器仍是增强版 Markdown）
- 侧栏自动生成目录（桌面 sticky，移动折叠）
- 标签 chips
- 分享按钮（原生 Web Share + 复制链接）
- 相关文章（同分类 → 同标签 → 最新，最多 3 篇）
- Article JSON-LD + BreadcrumbList JSON-LD + og:image/twitter:image
- 未发布文章 → `notFound()`；`robots: noindex` 只在预览模式

### 前台语言切换
- 当某篇仅有一种语言：显示"该文章暂未提供中文/English 版本"友好提示 + 切回可用语言按钮

### 后台 `/admin/blog`（重写列表）
- 表格列：封面缩略图 / 中英标题 / 分类 / 状态 / 作者 / 发布时间 / 浏览 / 推荐 / 操作
- 筛选：标题搜索、分类、状态、作者
- 状态徽标：draft / scheduled / published / unpublished
- 单条操作：编辑 / 预览 / 复制 / 发布 / 下架 / 软删除（二次确认）
- 批量：发布 / 下架 / 删除

### 后台 `/admin/blog/$id`（重写编辑）
- Tabs：**基础（中）| 基础（英）| 发布 | SEO | 封面/媒体**
- 中英各自：title / slug / excerpt / content（Markdown 编辑器 + 实时预览）
- 发布：状态、定时发布、推荐开关、允许评论、显示作者、显示阅读时间
- SEO：seo_title、meta_description、og_image、canonical、关键词（zh/en 各一份）
- 封面：从 `site-media` bucket 选择/上传（复用现有 File Library）
- **自动保存草稿**：3s 防抖、显示"最近保存时间"
- **未保存离开提示**：`useBlocker`
- **预览**：在新标签打开 `/blog/$slug?preview=<token>`，token 存 sessionStorage 校验

### 分类管理 `/admin/blog/categories`
新页面：新增 / 编辑 / 排序（↑↓ 按钮）/ 隐藏 / 删除（若分类下有文章则拒绝并提示重新分配）

### 后台侧栏
现有 `AdminShell` 已有单条 `Content — 文章`。改为 `Blog Management / 博客管理`（`Newspaper` 图标），点开显示子页面：文章列表、新建文章、分类管理。标签/评论/设置留 P2。

### 权限
复用现有 `has_role(_,'admin')`。P1 不细分 8 种权限，"是否管理员"即可控制入口和写操作（RLS 已在库层保护）。细分权限放 P2。

### SEO 基础设施
- `/sitemap.xml`：在现有 sitemap 里追加所有已发布文章 URL（zh + en 两条 `<url>` + hreflang）
- 若无 sitemap 路由则新建 `src/routes/sitemap[.]xml.ts`

---

## P2 · 增强（下轮）
- 标签管理页 + 前台标签筛选
- 评论表（`blog_comments`）+ 审核后台 + 前台评论表单（默认关闭，全局开关）
- 博客设置表（`blog_settings`）+ 后台设置页
- 富文本编辑器升级到 TipTap（保留 Markdown 兼容）
- 图片裁切 + WebP 自动转换
- 8 种细分权限
- RSS Feed `/rss.xml`

## P3 · 精修（视需要）
- 定时发布任务（pg_cron 触发 server route）
- 文章内嵌 YouTube/视频/按钮组件
- 全文搜索（Postgres `tsvector` 或 pg_trgm 索引）
- 浏览量去重（IP+UA hash / 24h 去重）
- 草稿协作、修订历史

---

## 技术要点
- 迁移采用 `ADD COLUMN IF NOT EXISTS` + 数据回填，不影响现有 4 张管理页面
- 前台 Markdown 渲染：`marked@^12` + `dompurify@^3`（体积 <50KB gzip，Worker 兼容）
- Server functions：`listPublicPosts` / `getPostBySlug` 用 server publishable client（RLS 已限只读已发布），管理端用 `requireSupabaseAuth`
- 图片：走现有 `site-media` bucket + File Library，不引入新上传组件
- **不动**：首页、服务、案例、工具、AI、关于、联系、导航顺序、Logo、品牌、i18n 机制、登录系统

---

## 交付边界确认
请回复：
1. **"开始 P1"** — 我按上述 P1 全量实施（预计 1 次大迁移 + 约 8-10 个文件改写/新增）
2. **"只做 X 部分"** — 例如"只做双语迁移+前台列表和详情"，其他留后
3. **调整方案** — 指出要删/加的部分
