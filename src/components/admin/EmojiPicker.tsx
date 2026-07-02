import * as React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type EmojiEntry = { e: string; k: string };

const CATEGORIES: { name: string; items: EmojiEntry[] }[] = [
  {
    name: "常用",
    items: [
      { e: "📁", k: "folder file" },
      { e: "🧰", k: "toolbox tools" },
      { e: "📄", k: "page document file" },
      { e: "📝", k: "note edit write" },
      { e: "⭐", k: "star favorite" },
      { e: "🔥", k: "fire hot" },
      { e: "✅", k: "check done ok" },
      { e: "❤️", k: "heart love" },
      { e: "📌", k: "pin" },
      { e: "🏷️", k: "tag label" },
      { e: "🔖", k: "bookmark" },
      { e: "🎯", k: "target goal" },
    ],
  },
  {
    name: "工具",
    items: [
      { e: "🧰", k: "tools" }, { e: "🔧", k: "wrench tool" }, { e: "🔨", k: "hammer" },
      { e: "🛠️", k: "tools" }, { e: "⚙️", k: "gear settings" }, { e: "🧪", k: "test lab" },
      { e: "🧮", k: "calc calculator" }, { e: "📐", k: "ruler" }, { e: "📏", k: "ruler" },
      { e: "🖨️", k: "printer" }, { e: "🖱️", k: "mouse" }, { e: "⌨️", k: "keyboard" },
    ],
  },
  {
    name: "交通",
    items: [
      { e: "🚗", k: "car drive dmv" }, { e: "🚙", k: "suv car" }, { e: "🚌", k: "bus" },
      { e: "🚎", k: "trolley" }, { e: "🏎️", k: "racecar" }, { e: "🚓", k: "police car" },
      { e: "🚑", k: "ambulance" }, { e: "🚒", k: "fire truck" }, { e: "🚐", k: "van" },
      { e: "🛻", k: "pickup truck" }, { e: "🚚", k: "truck" }, { e: "🚛", k: "truck lorry" },
      { e: "🚜", k: "tractor" }, { e: "🏍️", k: "motorcycle bike" }, { e: "🛵", k: "scooter" },
      { e: "🚲", k: "bicycle" }, { e: "🚦", k: "traffic light signal" }, { e: "🚥", k: "traffic" },
      { e: "🛑", k: "stop sign" }, { e: "⚠️", k: "warning" }, { e: "🅿️", k: "parking" },
      { e: "⛽", k: "gas fuel" }, { e: "🛣️", k: "road highway" }, { e: "🗺️", k: "map" },
    ],
  },
  {
    name: "文件",
    items: [
      { e: "📄", k: "page doc pdf" }, { e: "📃", k: "page" }, { e: "📑", k: "bookmark tabs" },
      { e: "📜", k: "scroll" }, { e: "📰", k: "news" }, { e: "📇", k: "card" },
      { e: "🗂️", k: "folder dividers" }, { e: "📁", k: "folder" }, { e: "📂", k: "folder open" },
      { e: "🗃️", k: "cabinet" }, { e: "🗄️", k: "cabinet" }, { e: "📊", k: "chart bar" },
      { e: "📈", k: "chart up" }, { e: "📉", k: "chart down" }, { e: "🖼️", k: "picture image" },
      { e: "📎", k: "attach clip" }, { e: "🔗", k: "link" }, { e: "📋", k: "clipboard" },
    ],
  },
  {
    name: "商业",
    items: [
      { e: "💱", k: "money exchange currency" }, { e: "💰", k: "money bag" },
      { e: "💵", k: "dollar cash money" }, { e: "💴", k: "yen" }, { e: "💶", k: "euro" },
      { e: "💷", k: "pound" }, { e: "💳", k: "card credit" }, { e: "🧾", k: "receipt invoice" },
      { e: "🏦", k: "bank" }, { e: "🏢", k: "office building" }, { e: "🏬", k: "store" },
      { e: "🛒", k: "cart shopping" }, { e: "📦", k: "package box" }, { e: "🏷️", k: "tag price" },
      { e: "💼", k: "briefcase business" }, { e: "📈", k: "growth" }, { e: "🤝", k: "deal handshake" },
    ],
  },
  {
    name: "教会",
    items: [
      { e: "⛪", k: "church" }, { e: "✝️", k: "cross christian" }, { e: "🕊️", k: "dove peace" },
      { e: "📖", k: "book bible" }, { e: "🙏", k: "pray" }, { e: "🕯️", k: "candle" },
      { e: "🎵", k: "music note" }, { e: "🎶", k: "music" }, { e: "👨‍👩‍👧", k: "family" },
      { e: "❤️", k: "love" }, { e: "🌍", k: "world mission" }, { e: "🏛️", k: "building" },
    ],
  },
  {
    name: "学习",
    items: [
      { e: "📚", k: "books study" }, { e: "📖", k: "book read" }, { e: "🎓", k: "grad school" },
      { e: "🏫", k: "school" }, { e: "✏️", k: "pencil" }, { e: "🖊️", k: "pen" },
      { e: "📝", k: "note test exam" }, { e: "🧠", k: "brain learn" }, { e: "💡", k: "idea bulb" },
      { e: "🔬", k: "science" }, { e: "🔭", k: "telescope" }, { e: "🧑‍🏫", k: "teacher" },
    ],
  },
  {
    name: "系统",
    items: [
      { e: "⚙️", k: "settings gear" }, { e: "🔧", k: "config" }, { e: "🖥️", k: "computer" },
      { e: "💻", k: "laptop" }, { e: "📱", k: "phone mobile" }, { e: "☁️", k: "cloud" },
      { e: "🔒", k: "lock secure" }, { e: "🔓", k: "unlock" }, { e: "🔑", k: "key" },
      { e: "🛡️", k: "shield security" }, { e: "🤖", k: "robot ai bot" }, { e: "🌐", k: "web internet" },
      { e: "🌍", k: "world global" }, { e: "📡", k: "satellite" }, { e: "🔔", k: "bell notify" },
      { e: "⚡", k: "power fast" }, { e: "🏗️", k: "construction build" }, { e: "🧩", k: "plugin puzzle" },
    ],
  },
  {
    name: "表情",
    items: [
      { e: "😀", k: "smile happy" }, { e: "😃", k: "smile" }, { e: "😄", k: "smile" },
      { e: "😊", k: "smile blush" }, { e: "😍", k: "love" }, { e: "🤩", k: "star" },
      { e: "😎", k: "cool" }, { e: "🤔", k: "think" }, { e: "😴", k: "sleep" },
      { e: "🙌", k: "hands celebrate" }, { e: "👍", k: "thumbs up ok" }, { e: "👏", k: "clap" },
      { e: "🎉", k: "party" }, { e: "🎊", k: "party" }, { e: "🏆", k: "trophy win" },
    ],
  },
];

export interface EmojiPickerProps {
  value?: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function EmojiPicker({ value, onChange, placeholder = "🚗", className }: EmojiPickerProps) {
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState("");

  const filtered = React.useMemo(() => {
    const kw = q.trim().toLowerCase();
    if (!kw) return CATEGORIES;
    return CATEGORIES.map(c => ({
      ...c,
      items: c.items.filter(i => i.k.includes(kw) || i.e.includes(kw)),
    })).filter(c => c.items.length > 0);
  }, [q]);

  const pick = (e: string) => {
    onChange(e);
    setOpen(false);
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="h-9 w-11 rounded-md border border-input bg-transparent grid place-items-center text-lg shadow-sm hover:bg-accent transition-colors"
            title="选择图标"
          >
            {value || <span className="text-muted-foreground text-base">🙂</span>}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-3" align="start">
          <Input
            autoFocus
            placeholder="搜索图标（如 car / church / pdf）"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="h-8 mb-2"
          />
          <div className="max-h-72 overflow-y-auto pr-1 space-y-3">
            {filtered.length === 0 && (
              <div className="text-center text-sm text-muted-foreground py-6">没有匹配的图标</div>
            )}
            {filtered.map(cat => (
              <div key={cat.name}>
                <div className="text-xs font-medium text-muted-foreground mb-1 px-1">{cat.name}</div>
                <div className="grid grid-cols-8 gap-1">
                  {cat.items.map((it, idx) => (
                    <button
                      key={`${cat.name}-${idx}-${it.e}`}
                      type="button"
                      onClick={() => pick(it.e)}
                      title={it.k}
                      className={cn(
                        "h-8 w-8 grid place-items-center rounded hover:bg-accent text-lg",
                        value === it.e && "bg-accent ring-1 ring-primary",
                      )}
                    >
                      {it.e}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {value && (
            <div className="mt-2 pt-2 border-t flex items-center justify-between">
              <span className="text-xs text-muted-foreground">当前：<span className="text-lg align-middle">{value}</span></span>
              <button
                type="button"
                onClick={() => { onChange(""); setOpen(false); }}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                清除
              </button>
            </div>
          )}
        </PopoverContent>
      </Popover>
      <Input
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1"
      />
    </div>
  );
}

export default EmojiPicker;
