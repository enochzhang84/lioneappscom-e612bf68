import * as React from "react";
import { useEditor } from "./ctx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TEXT_PRESETS } from "@/lib/photowall/presets";
import { RotateCcw, RotateCw, Star, Image as ImageIcon, Type, Music2, Sparkles } from "lucide-react";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[11px] font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function NumberSlider({
  label,
  value,
  min,
  max,
  step = 1,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-[11px] font-medium text-muted-foreground">{label}</Label>
        <span className="tabular-nums text-[11px] text-foreground/70">
          {Number(value.toFixed(2))}
          {suffix}
        </span>
      </div>
      <Slider value={[value]} min={min} max={max} step={step} onValueChange={(v) => onChange(v[0])} />
    </div>
  );
}

export function Inspector() {
  const { project, setProject, selection, patchSettings } = useEditor();

  const photo = selection.type === "photo" ? project.photos.find((p) => p.id === selection.id) : null;
  const text = selection.type === "text" ? project.texts.find((t) => t.id === selection.id) : null;
  const music = selection.type === "music" ? project.music.find((m) => m.id === selection.id) : null;

  const title = photo ? "图片属性" : text ? "文字属性" : music ? "音乐属性" : "画布属性";
  const Icon = photo ? ImageIcon : text ? Type : music ? Music2 : Sparkles;

  return (
    <aside className="hidden w-[300px] shrink-0 flex-col border-l border-border bg-background lg:flex">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <Icon className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold">{title}</span>
      </div>
      <div className="flex-1 space-y-5 overflow-y-auto p-4">
        {photo && (
          <>
            <div className="rounded-xl bg-muted/60 px-3 py-2 text-xs text-muted-foreground truncate">{photo.name}</div>
            <Row label="标题">
              <Input
                value={photo.title ?? ""}
                placeholder="图片标题"
                onChange={(e) =>
                  setProject((p) => ({ ...p, photos: p.photos.map((x) => (x.id === photo.id ? { ...x, title: e.target.value } : x)) }))
                }
              />
            </Row>
            <Row label="解说文字">
              <Textarea
                rows={3}
                value={photo.caption ?? ""}
                placeholder="这张照片的说明…"
                onChange={(e) =>
                  setProject((p) => ({ ...p, photos: p.photos.map((x) => (x.id === photo.id ? { ...x, caption: e.target.value } : x)) }))
                }
              />
            </Row>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-1"
                onClick={() =>
                  setProject((p) => ({ ...p, photos: p.photos.map((x) => (x.id === photo.id ? { ...x, rotate: (x.rotate - 90) % 360 } : x)) }))
                }
              >
                <RotateCcw className="h-3.5 w-3.5" /> 左转
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-1"
                onClick={() =>
                  setProject((p) => ({ ...p, photos: p.photos.map((x) => (x.id === photo.id ? { ...x, rotate: (x.rotate + 90) % 360 } : x)) }))
                }
              >
                <RotateCw className="h-3.5 w-3.5" /> 右转
              </Button>
            </div>
            <NumberSlider
              label="圆角"
              value={photo.radius}
              min={0}
              max={60}
              onChange={(v) => setProject((p) => ({ ...p, photos: p.photos.map((x) => (x.id === photo.id ? { ...x, radius: v } : x)) }))}
            />
            <NumberSlider
              label="白色边框"
              value={photo.border}
              min={0}
              max={24}
              onChange={(v) => setProject((p) => ({ ...p, photos: p.photos.map((x) => (x.id === photo.id ? { ...x, border: v } : x)) }))}
            />
            <NumberSlider
              label="焦点 X（裁剪重心）"
              value={photo.focusX}
              min={0}
              max={1}
              step={0.05}
              onChange={(v) => setProject((p) => ({ ...p, photos: p.photos.map((x) => (x.id === photo.id ? { ...x, focusX: v } : x)) }))}
            />
            <NumberSlider
              label="焦点 Y"
              value={photo.focusY}
              min={0}
              max={1}
              step={0.05}
              onChange={(v) => setProject((p) => ({ ...p, photos: p.photos.map((x) => (x.id === photo.id ? { ...x, focusY: v } : x)) }))}
            />
            <div className="flex items-center justify-between rounded-xl bg-muted/50 px-3 py-2">
              <span className="flex items-center gap-1.5 text-xs font-medium">
                <Star className="h-3.5 w-3.5 text-amber-500" /> 重点照片
              </span>
              <Switch
                checked={photo.highlight}
                onCheckedChange={(v) =>
                  setProject((p) => ({ ...p, photos: p.photos.map((x) => (x.id === photo.id ? { ...x, highlight: v } : x)) }))
                }
              />
            </div>
            <Row label="单张显示时间（秒，留空跟随全局）">
              <Input
                type="number"
                min={0.5}
                step={0.5}
                value={photo.duration ?? ""}
                onChange={(e) =>
                  setProject((p) => ({
                    ...p,
                    photos: p.photos.map((x) =>
                      x.id === photo.id ? { ...x, duration: e.target.value ? Number(e.target.value) : null } : x,
                    ),
                  }))
                }
              />
            </Row>
            <Row label="本张动画（留空跟随全局）">
              <Select
                value={photo.animationId ?? "__global"}
                onValueChange={(v) =>
                  setProject((p) => ({
                    ...p,
                    photos: p.photos.map((x) => (x.id === photo.id ? { ...x, animationId: v === "__global" ? null : v } : x)),
                  }))
                }
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="max-h-72">
                  <SelectItem value="__global">跟随全局设置</SelectItem>
                  {ANIMATION_LIBRARY.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.name} · {a.en}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Row>

          </>
        )}

        {text && (
          <>
            <Row label="内容">
              <Textarea
                rows={3}
                value={text.text}
                onChange={(e) => setProject((p) => ({ ...p, texts: p.texts.map((x) => (x.id === text.id ? { ...x, text: e.target.value } : x)) }))}
              />
            </Row>
            <Row label="文字模板">
              <Select
                value={text.preset}
                onValueChange={(v) => {
                  const pre = TEXT_PRESETS.find((x) => x.key === v)!;
                  setProject((p) => ({
                    ...p,
                    texts: p.texts.map((x) =>
                      x.id === text.id ? { ...x, preset: v, font: pre.font, color: pre.color, size: pre.size, shadow: pre.shadow } : x,
                    ),
                  }));
                }}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TEXT_PRESETS.map((t) => (
                    <SelectItem key={t.key} value={t.key}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Row>
            <NumberSlider
              label="字号（画布高度 %）"
              value={text.size}
              min={2}
              max={16}
              step={0.5}
              suffix="%"
              onChange={(v) => setProject((p) => ({ ...p, texts: p.texts.map((x) => (x.id === text.id ? { ...x, size: v } : x)) }))}
            />
            <Row label="颜色">
              <Input
                type="color"
                className="h-9 p-1"
                value={text.color}
                onChange={(e) => setProject((p) => ({ ...p, texts: p.texts.map((x) => (x.id === text.id ? { ...x, color: e.target.value } : x)) }))}
              />
            </Row>
            <Row label="对齐">
              <div className="grid grid-cols-3 gap-1.5">
                {(["left", "center", "right"] as const).map((a) => (
                  <Button
                    key={a}
                    size="sm"
                    variant={text.align === a ? "default" : "outline"}
                    onClick={() => setProject((p) => ({ ...p, texts: p.texts.map((x) => (x.id === text.id ? { ...x, align: a } : x)) }))}
                  >
                    {a === "left" ? "左" : a === "center" ? "中" : "右"}
                  </Button>
                ))}
              </div>
            </Row>
            <div className="flex items-center justify-between rounded-xl bg-muted/50 px-3 py-2">
              <span className="text-xs font-medium">文字阴影</span>
              <Switch
                checked={text.shadow}
                onCheckedChange={(v) => setProject((p) => ({ ...p, texts: p.texts.map((x) => (x.id === text.id ? { ...x, shadow: v } : x)) }))}
              />
            </div>
            <Row label="动画">
              <Select
                value={text.animation}
                onValueChange={(v) =>
                  setProject((p) => ({ ...p, texts: p.texts.map((x) => (x.id === text.id ? { ...x, animation: v as typeof x.animation } : x)) }))
                }
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TEXT_ANIMS.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.name} · {t.en}</SelectItem>
                  ))}
                </SelectContent>

              </Select>
            </Row>
            <div className="grid grid-cols-2 gap-2">
              <Row label="开始（秒）">
                <Input
                  type="number"
                  min={0}
                  step={0.5}
                  value={text.start}
                  onChange={(e) => setProject((p) => ({ ...p, texts: p.texts.map((x) => (x.id === text.id ? { ...x, start: Number(e.target.value) } : x)) }))}
                />
              </Row>
              <Row label="时长（秒）">
                <Input
                  type="number"
                  min={0.5}
                  step={0.5}
                  value={text.duration}
                  onChange={(e) => setProject((p) => ({ ...p, texts: p.texts.map((x) => (x.id === text.id ? { ...x, duration: Number(e.target.value) } : x)) }))}
                />
              </Row>
            </div>
          </>
        )}

        {music && (
          <>
            <div className="rounded-xl bg-muted/60 px-3 py-2 text-xs text-muted-foreground truncate">{music.name}</div>
            <NumberSlider
              label="音量"
              value={music.volume}
              min={0}
              max={1}
              step={0.05}
              onChange={(v) => setProject((p) => ({ ...p, music: p.music.map((x) => (x.id === music.id ? { ...x, volume: v } : x)) }))}
            />
            <NumberSlider
              label="淡入（秒）"
              value={music.fadeIn}
              min={0}
              max={10}
              step={0.5}
              onChange={(v) => setProject((p) => ({ ...p, music: p.music.map((x) => (x.id === music.id ? { ...x, fadeIn: v } : x)) }))}
            />
            <NumberSlider
              label="淡出（秒）"
              value={music.fadeOut}
              min={0}
              max={10}
              step={0.5}
              onChange={(v) => setProject((p) => ({ ...p, music: p.music.map((x) => (x.id === music.id ? { ...x, fadeOut: v } : x)) }))}
            />
            <NumberSlider
              label="裁剪起点（秒）"
              value={music.trimStart}
              min={0}
              max={Math.max(1, music.duration)}
              step={1}
              onChange={(v) => setProject((p) => ({ ...p, music: p.music.map((x) => (x.id === music.id ? { ...x, trimStart: v } : x)) }))}
            />
            <div className="flex items-center justify-between rounded-xl bg-muted/50 px-3 py-2">
              <span className="text-xs font-medium">循环播放</span>
              <Switch
                checked={music.loop}
                onCheckedChange={(v) => setProject((p) => ({ ...p, music: p.music.map((x) => (x.id === music.id ? { ...x, loop: v } : x)) }))}
              />
            </div>
          </>
        )}

        {!photo && !text && !music && (
          <>
            <p className="rounded-xl bg-muted/50 p-3 text-xs leading-relaxed text-muted-foreground">
              选中画布中的图片、文字或音乐即可编辑其属性。当前显示画布全局属性。
            </p>
            <Row label="背景颜色">
              <Input type="color" className="h-9 p-1" value={project.settings.bgColor} onChange={(e) => patchSettings({ bgColor: e.target.value })} />
            </Row>
            <Row label="主题色">
              <Input type="color" className="h-9 p-1" value={project.settings.accent} onChange={(e) => patchSettings({ accent: e.target.value })} />
            </Row>
            <NumberSlider label="卡片间距" value={project.settings.gap} min={0} max={60} onChange={(v) => patchSettings({ gap: v })} />
            <NumberSlider label="圆角" value={project.settings.radius} min={0} max={60} onChange={(v) => patchSettings({ radius: v })} />
            <div className="flex items-center justify-between rounded-xl bg-muted/50 px-3 py-2">
              <span className="text-xs font-medium">卡片阴影</span>
              <Switch checked={project.settings.shadow} onCheckedChange={(v) => patchSettings({ shadow: v })} />
            </div>
            <div className="flex items-center justify-between rounded-xl bg-muted/50 px-3 py-2">
              <span className="text-xs font-medium">随机轻微旋转</span>
              <Switch checked={project.settings.rotateRandom} onCheckedChange={(v) => patchSettings({ rotateRandom: v })} />
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
