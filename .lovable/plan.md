
# 工具管理：三级目录改造方案

## 目标结构（通用，不写死驾照宝典）

```
工具管理
└── 一级分类 (tool_categories)          例：驾照宝典 / 汇率换算 / 世界时间
    └── 二级工具 (tool_items，父节点)    例：小型车 C1 模拟考试
        └── 三级页面 (tool_items，子节点) 例：笔试 / 图标
```

三级页面才是真正可访问的页面（例如 `/p/drive-c1-written`）。二级工具本身可选是否有独立页面 —— 有子节点时默认作为分组展示。

## 一、数据库改动（最小侵入，保留全部数据）

给 `tool_items` 增加一个自引用字段：

- `parent_id uuid null references tool_items(id) on delete cascade`
- 索引 `(page_id, parent_id, sort_order)`

规则：
- `parent_id IS NULL` = 二级工具（分组节点）
- `parent_id` 指向另一个 `tool_items.id` = 三级页面（叶子）
- 现有所有条目 `parent_id = null`，行为不变，与旧结构完全兼容。

## 二、数据迁移（保留现有条目，不删除）

在同一次迁移里做一次 UPDATE + INSERT，仅针对目前"驾照宝典"下的三条：

- 新建二级工具"小型车 C1 模拟考试"（slug `drive-c1`），归属驾照宝典
  - 把"小型车 C1 模拟笔试考试"改名为"笔试"，slug 改为 `drive-c1-written`，`parent_id` 指向上面这个新工具
  - 把"小型车 C1 模拟图标考试"改名为"图标"，slug 改为 `drive-c1-signs`，`parent_id` 指向同上
- 新建二级工具"A/B 照模拟考试"（slug `drive-ab`），并在其下新建"笔试"（`drive-ab-written`）+"图标"（`drive-ab-signs`）两个空页面（复用 quiz 组件占位）

`link_url` 保留原有的 `app:drive-c1` 映射，保证嵌入考试组件不中断。

## 三、后端 (`src/lib/tools-admin.functions.ts`)

- `adminUpsertItem` schema 增加 `parent_id: uuid nullable`。
- 列表查询保持不变（一次拉全部 items），前端按 `parent_id` 组装树。
- 新增便捷函数：`adminMoveItem`（上下排序，作用在同一父节点内）。

## 四、后台 UI (`admin.tools.index.tsx`)

左侧目录改为三层树：

```
[▸] 📁 一级分类
     [▸] 🧰 二级工具         [编辑] [+ 新增子页面]
          • 三级页面
          • 三级页面
```

- 每一层都可展开/折叠（本地 state，按 id 记忆）。
- 一级分类右侧仍显示分类编辑面板，多了"+ 新增二级工具"按钮。
- 二级工具右侧面板：
  - 若已有三级页面 → 顶部一段"分组模式"提示 + 子页面排序列表 + "+ 新增子页面"
  - 若无子页面 → 保留现有完整工具编辑器（兼容旧结构）
- 三级页面右侧面板：复用现有 item 编辑器（slug/标题/正文/图片/视频/link_url/HTML/SEO）。
- 新增子页面：自动预填 `parent_id`，slug 建议为 `{父slug}-{子slug}`。

## 五、前台

### `/p/tools`（工具页面）
- 左侧栏：一级分类（点击切换）。
- 右侧内容区改为分组卡片布局：
  - 遍历该分类下 `parent_id = null` 的二级工具
  - 每个二级工具渲染为一个 section：标题 + 描述，下面并列展示其子页面卡片
  - 若二级工具没有子页面（旧数据），沿用当前平铺卡片行为
- 卡片跳转：子页面按 slug 走 `/p/tools/i/{itemSlug}`（保留 `link_url` http/绝对路径直跳逻辑）。

### 详情页 `/p/tools/i/{itemSlug}`
- 无需路由变化，仍用 slug 查询；三级页面 slug 唯一即可（`drive-c1-written` 等）。
- 面包屑显示：一级分类 › 二级工具 › 当前页面。

## 六、通用性

整套结构不与 DMV 耦合。以后新增"汇率换算 → 美元人民币 / 美元台币"或"世界时间 → 北京时间 / 纽约时间"时，直接：

1. 新增一级分类"汇率换算"
2. 在其下新增二级工具（可直接作为单页也可作为分组）
3. 需要多子页时，在二级工具下新增三级页面

## 七、交付顺序

1. 迁移：加 `parent_id` 列 + 合并 C1 数据 + 建 A/B 骨架
2. 后端 schema 增加 `parent_id`
3. 后台目录树 UI 三层化 + 子页面编辑器
4. 前台 `/p/tools` 分组渲染
5. 验证嵌入考试 (`app:drive-c1`) 仍可正常打开

确认后我按此顺序开始执行。
