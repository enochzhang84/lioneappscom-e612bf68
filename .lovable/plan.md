
## 目标

在【实用工具 → 换算工具】下建立一个可扩展的**单位换算中心**。所有换算器共用一个 `UnitConverter` 组件，新增单位只需加配置，不写页面逻辑。第一阶段完整上线【长度换算】8 个单位，其他分类后续按 config 追加。

## 架构（一次搭好，后续复用）

**1. 通用组件 `src/components/converter/UnitConverter.tsx`**

单一组件驱动所有换算页面。Props：
- `title` / `intro` — 页面标题、简介
- `units` — 单位定义数组：`{ key, name, symbol, toBase(v), fromBase(v) }`（用"到基准单位"函数支持温度这类非线性换算）
- `defaultUnit` / `defaultValue`
- `examples` — 常用换算示例（[{ from, to, note }]）
- `formulas` — 公式说明（Markdown 字符串数组）
- `faqs` — [{ q, a }]

组件内实现：
- 输入框 + 单位下拉 → 实时算出所有其它单位
- 结果表格（每行"复制"按钮 + 一键"复制全部"）
- 示例、公式、FAQ 三个折叠区块
- 移动端响应式

**2. 单位配置 `src/lib/converters/`**

- `types.ts` — `UnitDef`、`ConverterConfig` 类型
- `length.ts` — 长度 8 单位（m / ft / in / cm / mm / km / mile / yd），每个单位一份 `ConverterConfig`（标题、简介、示例、公式、FAQ、SEO）
- 后续 `area.ts` / `weight.ts` / `temperature.ts` / `volume.ts` / `finance.ts` … 按同样格式添加

一个 `getConverterConfig(key)` 索引函数，供插件使用。

**3. 插件注册 `src/lib/plugin-registry.tools.ts`**（沿用现有 PluginRegistry）

注册单一插件 `app:converter`。组件从 `config.converterKey` 读配置 key（如 `length-m`），再调 `UnitConverter` 渲染。

同时在 `src/routes/p.$slug.i.$itemSlug.tsx` 的 `EMBEDDED_APPS` 里添加分发逻辑：`app:converter:<key>` → 拿对应配置渲染。这样一个 link_url 直接指向单位配置，不必为每个单位改代码。

**4. SEO**

`p.$slug.i.$itemSlug.tsx` 的 `head()` 已从 tool_item / seo_meta 读取。给每个 tool_item 写入 seo_title / seo_description / seo_keywords（种子迁移里带上），Google 可独立收录。

## 数据（migration + 数据插入）

**Migration — 结构无需变**（沿用 tool_categories / tool_items）。仅需插入数据。

**Insert 数据**（分两个 insert 调用，不动 schema）：

1. 在【换算工具】父分类下创建 9 个子分类：📏长度 / 📐面积 / ⚖️重量 / 🌡️温度 / 💧体积 / 💱金融 / 🏗️装修 / 🚚物流 / 🚗汽车。字段：icon(emoji)、slug、sort_order、is_active。

2. 在【长度换算】下插入 8 个 tool_item：米 / 英尺 / 英寸 / 厘米 / 毫米 / 公里 / 英里 / 码。每条：
   - `link_url = app:converter:length-<unit>`
   - `seo_title` / `seo_description` / `seo_keywords`
   - `sort_order`

其它 8 个分类只建**分类**（空目录 + 前台标记"即将上线"），第二/三阶段再灌工具项。

## 后台

复用现有【工具管理】树，无需改后台代码：新分类和 items 会自动出现在树里，管理员可以编辑标题/简介/图标/SEO/启用停用/排序/复制链接（现有 UI 已支持）。

## 前台

- `/p/tools`（换算工具页面）已按 tool_categories 渲染 → 自动显示 9 个新分类。
- 点击【长度换算】进入分类页 → 显示 8 个单位卡片。
- 点击卡片 → `/p/tools/i/<slug>` → EMBEDDED_APPS 分发到 `UnitConverter`。

## 第一阶段交付清单

- [ ] `src/lib/converters/types.ts`
- [ ] `src/lib/converters/length.ts`（8 个 config，含 examples/formulas/FAQ/SEO）
- [ ] `src/lib/converters/index.ts`（`getConverterConfig`）
- [ ] `src/components/converter/UnitConverter.tsx`
- [ ] `src/routes/p.$slug.i.$itemSlug.tsx` 加 `app:converter:*` 分发
- [ ] Insert 9 个分类 + 8 个长度 tool_items（含 SEO）
- [ ] 不动 DMV、圣经、其它现有工具

## 第二 / 三阶段（本次不实现）

- 阶段 2：`area.ts` / `weight.ts` / `temperature.ts` / `volume.ts` + 对应 tool_items（温度用 `toBase/fromBase` 非线性映射，验证组件已支持）
- 阶段 3：`finance.ts`（汇率需接实时 API，另做方案）/ 装修 / 物流 / 汽车

## 注意事项

- 不改 tool_categories / tool_items 结构，只加数据
- 不重写现有插件系统，只加一个 `app:converter` 分发
- 一份组件跑所有换算器，新单位只写 config

确认后开始实现第一阶段。
