import * as React from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { runAiTool } from "@/lib/ai.functions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Copy, Check, Sparkles } from "lucide-react";
import { toast } from "sonner";

type FieldType = "text" | "textarea" | "select";
type Field = {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  options?: { value: string; label: string }[];
  defaultValue?: string;
  rows?: number;
};

type AiToolConfig = {
  title: string;
  description: string;
  system: string;
  fields: Field[];
  /** Build the user prompt from field values. */
  buildUser: (values: Record<string, string>) => string;
  temperature?: number;
  submitLabel?: string;
};

/**
 * All AI tool configs. Key must match the DB link_url after `app:ai:` prefix.
 * 添加新的 AI 工具 = 在此对象里加一条 + 后台加一条 tool_items（link_url = app:ai:xxx）。
 */
const CONFIGS: Record<string, AiToolConfig> = {
  // ============== 写作 ==============
  "writer-article": {
    title: "文章生成器",
    description: "输入主题、关键词与写作风格，AI 生成完整博客/公众号文章。",
    system:
      "你是一位专业中文内容创作者。请根据用户提供的主题与关键词，写一篇结构清晰（含小标题、要点、结论）的文章，语言自然、条理分明。",
    fields: [
      { key: "topic", label: "主题", type: "text", placeholder: "例如：如何提升团队远程办公效率" },
      { key: "keywords", label: "关键词（逗号分隔，可选）", type: "text", placeholder: "远程、协作、Notion" },
      {
        key: "tone",
        label: "写作风格",
        type: "select",
        options: [
          { value: "专业", label: "专业" },
          { value: "轻松", label: "轻松" },
          { value: "营销", label: "营销" },
          { value: "口语化", label: "口语化" },
        ],
        defaultValue: "专业",
      },
      {
        key: "length",
        label: "长度",
        type: "select",
        options: [
          { value: "短（400-600字）", label: "短（400-600字）" },
          { value: "中（800-1200字）", label: "中（800-1200字）" },
          { value: "长（1500-2500字）", label: "长（1500-2500字）" },
        ],
        defaultValue: "中（800-1200字）",
      },
    ],
    buildUser: (v) =>
      `主题：${v.topic}\n关键词：${v.keywords || "无"}\n风格：${v.tone}\n长度：${v.length}\n请直接输出文章正文，使用 Markdown 格式。`,
  },
  "writer-email": {
    title: "邮件生成器",
    description: "生成商务、日常、道歉、邀请等各种邮件。",
    system: "你是资深商务写作助理，擅长撰写清晰、礼貌、专业的邮件。",
    fields: [
      { key: "purpose", label: "邮件目的", type: "text", placeholder: "例如：向客户道歉发货延迟" },
      { key: "to", label: "收件人（可选）", type: "text", placeholder: "客户 / 老板 / 同事" },
      { key: "points", label: "关键要点", type: "textarea", rows: 4, placeholder: "每行一条" },
      {
        key: "tone",
        label: "语气",
        type: "select",
        options: [
          { value: "正式", label: "正式" },
          { value: "友好", label: "友好" },
          { value: "简洁", label: "简洁" },
        ],
        defaultValue: "正式",
      },
      {
        key: "lang",
        label: "语言",
        type: "select",
        options: [
          { value: "中文", label: "中文" },
          { value: "英文", label: "英文" },
        ],
        defaultValue: "中文",
      },
    ],
    buildUser: (v) =>
      `目的：${v.purpose}\n收件人：${v.to || "未指定"}\n要点：\n${v.points}\n语气：${v.tone}\n语言：${v.lang}\n请输出完整邮件（含主题行）。`,
  },
  "writer-title": {
    title: "标题生成器",
    description: "为公众号、博客、短视频生成 10 条爆款标题。",
    system: "你是精通标题写作的中文编辑，擅长制造好奇、共情、数字、悬念等钩子。",
    fields: [
      { key: "topic", label: "内容概要", type: "textarea", rows: 3, placeholder: "简短描述文章内容" },
      {
        key: "platform",
        label: "平台",
        type: "select",
        options: [
          { value: "公众号", label: "公众号" },
          { value: "博客/SEO", label: "博客/SEO" },
          { value: "抖音/小红书", label: "抖音/小红书" },
          { value: "YouTube", label: "YouTube" },
        ],
        defaultValue: "公众号",
      },
    ],
    buildUser: (v) => `内容概要：${v.topic}\n平台：${v.platform}\n请生成 10 条不同风格的标题，编号输出。`,
  },
  "writer-product": {
    title: "产品介绍生成器",
    description: "为电商 / 官网生成营销文案。",
    system: "你是资深电商文案，擅长突出卖点、解决用户痛点、结尾促单。",
    fields: [
      { key: "name", label: "产品名称", type: "text" },
      { key: "features", label: "核心卖点（每行一条）", type: "textarea", rows: 4 },
      { key: "audience", label: "目标客户", type: "text", placeholder: "宝妈 / 白领 / 摄影师…" },
    ],
    buildUser: (v) =>
      `产品：${v.name}\n卖点：\n${v.features}\n目标客户：${v.audience}\n请输出：一句 slogan + 3 段介绍 + 5 条特性 bullet + 结尾 CTA。`,
  },

  // ============== 翻译 ==============
  "translate-cnen": {
    title: "中英文翻译",
    description: "自动识别方向翻译，保留专业术语。",
    system:
      "你是专业中英翻译。自动判断输入语言：若为中文则翻译成地道英文；若为英文则翻译成通顺中文。仅输出译文，不要解释。",
    fields: [{ key: "text", label: "原文", type: "textarea", rows: 8 }],
    buildUser: (v) => v.text,
    temperature: 0.3,
  },
  "translate-multi": {
    title: "多语言翻译",
    description: "翻译到日、韩、法、德、西班牙等语言。",
    system: "你是专业多语言翻译。仅输出译文，不要解释。",
    fields: [
      { key: "text", label: "原文", type: "textarea", rows: 6 },
      {
        key: "target",
        label: "目标语言",
        type: "select",
        options: [
          { value: "English", label: "英文" },
          { value: "日本語", label: "日语" },
          { value: "한국어", label: "韩语" },
          { value: "Français", label: "法语" },
          { value: "Deutsch", label: "德语" },
          { value: "Español", label: "西班牙语" },
          { value: "简体中文", label: "简体中文" },
          { value: "繁體中文", label: "繁体中文" },
        ],
        defaultValue: "English",
      },
    ],
    buildUser: (v) => `请将以下内容翻译成 ${v.target}：\n\n${v.text}`,
    temperature: 0.3,
  },

  // ============== 总结 ==============
  "sum-article": {
    title: "文章总结",
    description: "长文提炼摘要与要点。",
    system: "你是内容摘要助手。输出格式：先一段 100 字以内摘要，再 3-5 条要点（数字编号）。",
    fields: [{ key: "text", label: "文章正文", type: "textarea", rows: 12 }],
    buildUser: (v) => v.text,
  },
  "sum-web": {
    title: "网页总结",
    description: "粘贴网页正文，AI 生成摘要与要点。",
    system: "你是网页阅读摘要助手。输出：一句话总结 + 5 条要点 + 结论。",
    fields: [{ key: "text", label: "网页正文", type: "textarea", rows: 12 }],
    buildUser: (v) => v.text,
  },

  // ============== 改写 ==============
  "rewrite-polish": {
    title: "智能改写",
    description: "润色、扩写、缩写、切换口吻。",
    system: "你是资深中文编辑，按用户指定风格改写原文，保持核心信息不变。仅输出改写后的文本。",
    fields: [
      { key: "text", label: "原文", type: "textarea", rows: 8 },
      {
        key: "mode",
        label: "改写方式",
        type: "select",
        options: [
          { value: "润色（更流畅）", label: "润色（更流畅）" },
          { value: "扩写 1.5 倍", label: "扩写 1.5 倍" },
          { value: "缩写到 50%", label: "缩写到 50%" },
          { value: "更正式", label: "更正式" },
          { value: "更口语", label: "更口语" },
          { value: "更专业", label: "更专业" },
        ],
        defaultValue: "润色（更流畅）",
      },
    ],
    buildUser: (v) => `改写方式：${v.mode}\n原文：\n${v.text}`,
  },

  // ============== SEO ==============
  "seo-title": {
    title: "SEO 标题生成",
    description: "60 字符以内高点击 SEO 标题（5 条）。",
    system: "你是 SEO 专家。输出 5 条 SEO 友好的标题，每条 < 60 字符，编号输出。",
    fields: [
      { key: "topic", label: "页面主题", type: "text" },
      { key: "keywords", label: "目标关键词", type: "text" },
    ],
    buildUser: (v) => `主题：${v.topic}\n关键词：${v.keywords}`,
  },
  "seo-desc": {
    title: "SEO Description 生成",
    description: "160 字符以内 Meta Description。",
    system: "你是 SEO 专家。生成 3 条 Meta Description，每条 < 160 字符，包含关键词与行动引导。",
    fields: [
      { key: "topic", label: "页面主题", type: "text" },
      { key: "keywords", label: "关键词", type: "text" },
    ],
    buildUser: (v) => `主题：${v.topic}\n关键词：${v.keywords}`,
  },
  "seo-keywords": {
    title: "SEO 关键词生成",
    description: "输出核心词与长尾词组合。",
    system: "你是 SEO 关键词研究专家。输出：5 个核心词 + 15 个长尾词，分组显示。",
    fields: [{ key: "topic", label: "主题 / 行业", type: "text" }],
    buildUser: (v) => v.topic,
  },

  // ============== Prompt ==============
  "prompt-optimize": {
    title: "Prompt 优化器",
    description: "将粗略提示词优化成结构化高质量 Prompt。",
    system:
      "你是 Prompt 工程专家。请把用户输入的原始 Prompt 改写为高质量结构化 Prompt（角色 + 任务 + 输入 + 输出格式 + 约束）。仅输出优化后的 Prompt。",
    fields: [{ key: "prompt", label: "原始 Prompt", type: "textarea", rows: 6 }],
    buildUser: (v) => v.prompt,
  },
  "prompt-generate": {
    title: "Prompt 生成器",
    description: "按任务类型生成完整 Prompt。",
    system: "你是 Prompt 工程专家。根据用户描述的目标，生成一段可直接使用的高质量 Prompt。",
    fields: [
      { key: "goal", label: "目标", type: "textarea", rows: 4, placeholder: "描述你想让 AI 完成的任务" },
    ],
    buildUser: (v) => v.goal,
  },

  // ============== 编程 ==============
  "code-sql": {
    title: "SQL 生成",
    description: "自然语言 → SQL 查询。",
    system: "你是 SQL 专家。根据用户需求生成正确的 SQL（默认 PostgreSQL 语法），并简要说明。",
    fields: [
      { key: "req", label: "需求描述", type: "textarea", rows: 4 },
      { key: "schema", label: "表结构（可选）", type: "textarea", rows: 4 },
    ],
    buildUser: (v) => `需求：${v.req}\n\n表结构：\n${v.schema || "未提供"}`,
    temperature: 0.2,
  },
  "code-explain": {
    title: "代码解释",
    description: "逐行解释代码逻辑。",
    system: "你是资深工程师。请用中文逐段解释以下代码的作用、边界条件和潜在问题。",
    fields: [{ key: "code", label: "代码", type: "textarea", rows: 12 }],
    buildUser: (v) => v.code,
    temperature: 0.2,
  },
  "code-optimize": {
    title: "代码优化",
    description: "重构、性能建议、Best Practice。",
    system:
      "你是资深工程师。请优化以下代码：给出重写版本 + 3-5 条改进说明（性能、可读性、边界处理）。",
    fields: [{ key: "code", label: "代码", type: "textarea", rows: 12 }],
    buildUser: (v) => v.code,
    temperature: 0.2,
  },
  "code-regex": {
    title: "Regex 生成",
    description: "自然语言 → 正则表达式。",
    system: "你是正则表达式专家。根据需求生成正则 + 解释，并给出 2 个匹配示例、1 个不匹配示例。",
    fields: [{ key: "req", label: "匹配需求", type: "textarea", rows: 4 }],
    buildUser: (v) => v.req,
    temperature: 0.2,
  },
  "code-json": {
    title: "JSON 生成",
    description: "根据描述生成 JSON 示例。",
    system: "你是数据结构专家。根据描述输出格式良好的 JSON 示例（含注释说明字段）。",
    fields: [{ key: "req", label: "数据描述", type: "textarea", rows: 5 }],
    buildUser: (v) => v.req,
    temperature: 0.3,
  },

  // ============== 办公 ==============
  "office-meeting": {
    title: "会议纪要",
    description: "会议文字 → 结构化会议纪要。",
    system:
      "你是会议纪要助手。输出格式：\n【会议摘要】...\n【决议】1... 2...\n【待办】- @负责人: 事项 (截止日)\n【风险/问题】...",
    fields: [{ key: "text", label: "会议文字（录音转写或速记）", type: "textarea", rows: 12 }],
    buildUser: (v) => v.text,
  },
  "office-excel": {
    title: "Excel 公式助手",
    description: "自然语言 → Excel/Sheets 公式。",
    system: "你是 Excel 专家。输出：公式 + 简要中文解释 + 使用示例。同时给出 Google Sheets 版本（如不同）。",
    fields: [{ key: "req", label: "需求", type: "textarea", rows: 4 }],
    buildUser: (v) => v.req,
    temperature: 0.2,
  },
  "office-ppt": {
    title: "PPT 大纲生成",
    description: "生成完整幻灯片结构。",
    system: "你是资深演讲教练。输出 PPT 大纲：封面、目录、5-10 张内容页（每页标题 + 3 条要点）、总结页。",
    fields: [
      { key: "topic", label: "演讲主题", type: "text" },
      { key: "audience", label: "受众", type: "text", placeholder: "客户 / 团队 / 投资人" },
    ],
    buildUser: (v) => `主题：${v.topic}\n受众：${v.audience}`,
  },
};

export function AiToolByKey({ toolKey }: { toolKey: string }) {
  const cfg = CONFIGS[toolKey];
  const runFn = useServerFn(runAiTool);

  const initial = React.useMemo(() => {
    const v: Record<string, string> = {};
    if (cfg) for (const f of cfg.fields) v[f.key] = f.defaultValue ?? "";
    return v;
  }, [cfg]);
  const [values, setValues] = React.useState<Record<string, string>>(initial);
  const [output, setOutput] = React.useState("");
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    setValues(initial);
    setOutput("");
  }, [initial]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!cfg) throw new Error("未找到该 AI 工具配置");
      const user = cfg.buildUser(values);
      if (!user.trim()) throw new Error("请填写必要信息");
      return runFn({
        data: {
          toolKey,
          system: cfg.system,
          user,
          temperature: cfg.temperature,
        },
      });
    },
    onSuccess: (r) => setOutput(r.output),
    onError: (e: Error) => toast.error(e.message || "AI 调用失败"),
  });

  if (!cfg) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 text-center">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-8 text-amber-800">
          该 AI 工具尚未接入（key: <code>{toolKey}</code>）。
        </div>
      </div>
    );
  }

  async function handleCopy() {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    toast.success("已复制");
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 md:px-6 py-8">
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <Sparkles size={12} /> Lione AI · Powered by Lovable AI Gateway
        </div>
        <h2 className="mt-3 text-2xl font-bold tracking-tight">{cfg.title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{cfg.description}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Inputs */}
        <div className="space-y-4 rounded-xl border border-border bg-card p-5">
          {cfg.fields.map((f) => (
            <div key={f.key} className="space-y-1.5">
              <Label htmlFor={`ai-${f.key}`}>{f.label}</Label>
              {f.type === "text" && (
                <Input
                  id={`ai-${f.key}`}
                  value={values[f.key] ?? ""}
                  placeholder={f.placeholder}
                  onChange={(e) => setValues((s) => ({ ...s, [f.key]: e.target.value }))}
                />
              )}
              {f.type === "textarea" && (
                <Textarea
                  id={`ai-${f.key}`}
                  rows={f.rows ?? 5}
                  value={values[f.key] ?? ""}
                  placeholder={f.placeholder}
                  onChange={(e) => setValues((s) => ({ ...s, [f.key]: e.target.value }))}
                />
              )}
              {f.type === "select" && (
                <select
                  id={`ai-${f.key}`}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={values[f.key] ?? ""}
                  onChange={(e) => setValues((s) => ({ ...s, [f.key]: e.target.value }))}
                >
                  {f.options?.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ))}

          <Button
            className="w-full"
            disabled={mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 animate-spin" size={16} /> 生成中…
              </>
            ) : (
              <>
                <Sparkles className="mr-2" size={16} /> {cfg.submitLabel ?? "生成"}
              </>
            )}
          </Button>
        </div>

        {/* Output */}
        <div className="rounded-xl border border-border bg-card p-5 min-h-[300px] flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium">AI 输出</div>
            {output && (
              <Button size="sm" variant="ghost" onClick={handleCopy}>
                {copied ? <Check size={14} /> : <Copy size={14} />}
                <span className="ml-1 text-xs">{copied ? "已复制" : "复制"}</span>
              </Button>
            )}
          </div>
          <div className="flex-1 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
            {output ? (
              output
            ) : (
              <div className="text-muted-foreground italic">
                填写左侧信息并点击「生成」，AI 输出将在此处显示。
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
