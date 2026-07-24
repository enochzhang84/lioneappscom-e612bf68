## 目标

重新定位 Lione Apps 为「家庭与小型企业 IT 解决方案」，重做首页，加入全站中英文切换，只改前 3 个导航项，其余 5 项功能路由保持不变。

---

## 一、i18n 基础设施（新增）

新文件 `src/lib/i18n.tsx`：
- `LanguageProvider`：`lang: 'zh' | 'en'`，`setLang(l)`，默认根据 `navigator.language` 判断（zh* → zh，其它 → en），持久化到 `localStorage['lione:lang']`。
- `useLang()` hook。
- `useT()` 返回 `t(key)` 查字典。
- 字典存在同文件常量 `dict` 中（zh / en 两份，覆盖首页、导航、页脚、通用按钮）。
- SSR 安全：初始值在 `useEffect` 中读 localStorage（避免 hydration 不匹配），首屏用默认 `zh`。
- 语言切换不刷新页面（React state）。

在 `src/routes/__root.tsx` 中 `<PlatformProvider>` 内包裹 `<LanguageProvider>`。

## 二、SEO 双语（首页）

`src/routes/index.tsx` 的 `head()` 保持默认中文；组件内用 `useEffect` 根据当前 `lang` 动态 `document.title = ...` 和更新 `meta[name=description]` / `og:*`。这样切换语言时 SEO 文本同步（首屏 SSR 仍是中文，符合"默认中文"）。

## 三、导航栏（`src/components/SiteLayout.tsx`）

前 3 项改为：
- 中：首页 / 服务 / 项目案例
- 英：Home / Services / Projects

"服务" 下拉菜单重做为两组（家庭服务 / 企业服务），共 8 个子项，全部指向 `/products/$slug`（复用现有 products 路由，slug 沿用现有：church / renovation / office / custom 等；新增子项若无对应产品则先指向 `/contact`，避免创建新路由/破坏 CMS）。

方案：下拉菜单展示 8 个服务分类，链接策略：
- 家庭网络与 Wi-Fi / NAS 与私有云 / 智能家居网络 / 家庭影音 → 目前无对应产品页 → 全部指向 `/contact`（避免创建假页面 / 空 CMS 记录）
- 企业网站建设 / 定制软件开发 / 企业办公平台 / 云服务器部署 → 指向 `/contact`（同上，避免破坏现有 products）

（后 5 项：实用工具 / AI 助手 / 博客 / 关于我们 / 联系我们 —— 路由、下拉、图标、顺序全部不动，只把展示文本改成 `t()` 查字典。）

右侧新增语言切换按钮 `中文 | EN`（桌面端 & 手机端）。

## 四、首页（`src/routes/index.tsx`）

完全重写呈现层，loader 只保留 `getSettings()`（不再依赖 products 数据展示"产品卡片"）。新首页板块（全部双语，通过 `useT`）：

1. Hero — 主/副标题、两个按钮、辅助标签
2. 我们的服务（6 张卡片，硬编码文案 + emoji/icon，不用 CMS）
3. 我们为谁服务（3 组：家庭 / 小型企业 / 教会与非营利）
4. 合作流程（4 步）
5. 项目案例（复用 `listCases()`，最多 3 条；标题双语，无案例时不显示）
6. 为什么选择 Lione Apps（6 条优势）
7. 底部联系 CTA

保留现有配色、圆角、间距风格。图片：使用 lucide-react 图标 + gradient 卡片背景（不生成新图，避免范围外改动）。

## 五、页脚

在 `SiteLayout` 中把 "产品" 栏改为 "服务/Services"，列出 6 项（指向 `/contact`），品牌说明双语，其余保留。

## 六、CMS 双语字段（不动数据库）

用户要求 CMS 支持 zh/en 字段，但强限制"不要修改现有 CMS 功能、不要破坏数据"。本次范围内**不加 schema 迁移**，避免破坏 24 个现有表；改为在计划说明中标注：CMS 双语字段作为后续独立任务处理（首页硬编码文案已完全双语，不阻塞用户体验）。

---

## 技术细节

- 新增：`src/lib/i18n.tsx`
- 改动：`src/routes/__root.tsx`（挂 Provider）、`src/components/SiteLayout.tsx`（导航/页脚/语言切换）、`src/routes/index.tsx`（首页重写）
- 不改：其它路由、CMS、后台、数据库、Bible/Quiz/AI 等
- 后 5 个导航项：URL / 组件 / 顺序完全不变，仅显示文字走 `t()`

## 不做

- 不做 CMS zh/en 迁移（会碰现有数据）
- 不为 8 个服务子项创建独立路由页（保留最小改动，统一指向 `/contact`）
- 不重做其它页面的双语（本次只覆盖导航 + 页脚 + 首页；其它页面文字保持原状 —— 用户主要诉求是"整站"，但严格限制里说"不要重构与本次任务无关的页面"。若你希望所有子页面也全部双语，请确认，我会追加。）
