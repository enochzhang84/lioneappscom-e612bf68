
# Lione Apps Platform 后台架构重规划

一次性搭好长期骨架，之后所有新功能"往里塞"，而不是"改后台"。

---

## 一、核心理念

- **Platform First**：Lione Apps 不是一个网站后台，而是数字化平台。所有能力优先做成平台级公共模块。
- **Build Once, Reuse Everywhere**：新功能先问"是否可复用 / 是否属于 Platform Core / 是否其它产品也能用"。
- **一个 Sidebar**：整个 Platform Admin 只保留一套导航，不再新增第二个 sidebar。
- **模块化产品 + 插件化工具**：产品可独立启用/隐藏；工具作为 Plugin 注册，加工具不改后台。

---

## 二、后台顶层导航（唯一 Sidebar）

```text
📊 Dashboard          仪表盘
📂 Content            页面 / 博客 / 案例 / 菜单 / SEO
🧰 Tools              工具中心（Plugin 化）
📚 Exams              考试与题库
📦 Products           产品模块（Website / Church / Construction / CRM / AI …）
📈 Analytics          运营中心（PV / UV / 转化 / 事件）
👤 Users              用户 / 角色 / 权限
📁 Files              文件 / 图片 / 媒体
🔔 Notifications      通知中心
📋 Logs               操作日志 / 审计
⚙  Platform Settings  站点设置 / 品牌 / API Key / 邮件 / AI / 集成
```

现有 15 个入口重新归到这 11 个 Group 下，不再散乱。

---

## 三、Platform Core（跨产品复用）

以下能力做成"和具体产品解耦"的核心层，官网、教会、装修、CRM、AI 全部共用：

- 认证 Auth / 角色 RBAC / 权限 Permission
- 页面 Pages / 菜单 Menus / SEO Meta
- 文件 Files / 图片 Media
- 文章 Blog / 帮助文档 Docs
- 通知 Notifications / 日志 Activity Logs
- 运营统计 Analytics（pageviews + 自定义事件）
- 搜索 Search / AI 接口 / 对外 API
- 平台设置 Settings（品牌、域名、支付、集成）

产品模块只写"业务表 + 业务页面"，禁止重复实现上述能力。

---

## 四、产品模块化（Product Modules）

每个产品是一个可插拔模块：

- Website（官网）
- Church（教会管理，含 HOC3）
- Construction（装修报价）
- CRM
- AI Tools
- DMV（作为 Tools 下的 Exam 模块）

统一 metadata：`key / name / icon / enabled / visible / route_prefix / required_roles`。

后台 Products 中心提供"启用/隐藏/排序"开关；导航根据启用状态动态生成。

---

## 五、工具插件化（Tool Plugins）

工具（DMV、汇率、PDF、二维码、图片、世界时间、AI …）统一注册为 Tool Plugin：

```text
plugin = {
  slug, name, icon, category,
  component_key,        // 前端组件映射
  config_schema,        // JSON Schema 参数
  required_capability   // exams / files / ai …
}
```

新增工具只需：
1. 在 `tool_plugins` 里加一条记录
2. 在前端 `PluginRegistry` 注册一个组件

不改 sidebar、不改路由、不改后台。

---

## 六、统一 UI 规范（Design System）

所有模块必须用同一套组件，禁止各页面自定义：

- `<PageHeader />` 顶部标题+操作区
- `<DataTable />` 搜索 / 排序 / 分页 / 批量操作 / 列显示
- `<FormPanel />` 表单弹窗（新增/编辑）
- `<ConfirmDialog />` 危险操作确认
- `<EmptyState />` / `<StatusBadge />` / `<Toolbar />`
- 统一按钮层级（primary / secondary / ghost / destructive）

现有 admin 页面逐步替换到这套组件。

---

## 七、数据分层（Schema 约定）

```text
platform_*     Platform Core：platform_settings / platform_menus / platform_events
content_*      内容层：content_pages / content_blocks / content_blog / content_seo
product_*      产品模块：product_church_* / product_construction_* / product_crm_*
tool_*         工具与插件：tool_plugins / tool_categories / tool_items
exam_*         考试：exam_definitions / exam_questions / exam_attempts
system_*       系统：system_users / system_roles / system_permissions / system_logs / system_notifications
```

现有表沿用当前命名（pages / tool_items / quiz_* 等），新表全部按上表前缀。

---

## 八、权限模型

- 角色：`super_admin / admin / editor / viewer / product_owner:<key>`
- 权限：`<module>:<action>`（如 `content.pages.write`、`tools.plugin.install`）
- 每个产品模块可挂"模块级角色"（比如 Church 的 pastor / member）
- 后台菜单、按钮、API 都通过 `hasPermission()` 统一判定

---

## 九、迁移计划（4 步，每步独立可上线）

### 第 1 步 · 骨架统一
- 重排 AdminShell 为 11 个模块
- 抽 `PageHeader / DataTable / FormPanel / ConfirmDialog` 为 Platform UI Kit
- 老页面继续可用，逐步切换

### 第 2 步 · Platform Core 沉淀
- 建 `platform_settings / platform_menus / system_permissions / system_roles`
- 把菜单、品牌、邮件、AI Key 搬进 Platform Settings
- 权限中间件统一（后端 + 前端）

### 第 3 步 · 产品模块化
- 建 `product_modules` 表（模块清单 + 启用状态）
- Products 中心提供开关；sidebar 根据启用状态生成
- Website 作为第一个模块跑通

### 第 4 步 · 工具插件化
- 建 `tool_plugins` 表 + 前端 `PluginRegistry`
- 现有 DMV / 空气制动 / 组合车辆 / 商业驾驶迁移为 Plugin
- 加工具 = 加一条记录 + 注册一个组件

---

## 十、开发准则（每次动手前自检）

1. 这是"平台能力"还是"业务功能"？—— 平台能力进 Platform Core
2. 其它产品会不会用到？—— 会 → 抽公共
3. 数据表前缀是否符合分层？
4. UI 是否使用统一组件？
5. 权限是否走 `hasPermission()`？
6. 加工具/加页面是否需要改后台代码？—— 不应该

---

## 十一、这次要不要立刻动手？

这份规划是"宪法级"文档，落地建议分步走。请确认：

- **A. 只保存规划**：把本文档存入 `.lovable/plan.md` 与 `mem://` 作为长期约束，暂不改代码。
- **B. 立刻做第 1 步**：本轮同时开始"骨架统一 + Platform UI Kit"（约影响 AdminShell + 5~8 个组件文件，老功能不破坏）。
- **C. A + B**：既保存规划，又立刻启动第 1 步。

选一个，我按选择执行。
