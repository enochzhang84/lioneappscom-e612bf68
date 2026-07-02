import * as React from "react";
import { Upload, X, FileIcon } from "lucide-react";

export function FileDrop({
  accept,
  multiple = false,
  files,
  onChange,
  hint,
}: {
  accept: string;
  multiple?: boolean;
  files: File[];
  onChange: (files: File[]) => void;
  hint?: string;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [drag, setDrag] = React.useState(false);

  function handleFiles(list: FileList | null) {
    if (!list) return;
    const arr = Array.from(list);
    onChange(multiple ? [...files, ...arr] : arr.slice(0, 1));
  }

  function remove(i: number) {
    onChange(files.filter((_, idx) => idx !== i));
  }

  function move(i: number, dir: -1 | 1) {
    const next = [...files];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  }

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition
          ${drag ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/40"}`}
      >
        <Upload size={28} className="mx-auto text-muted-foreground mb-2" />
        <p className="text-sm font-medium">点击或拖拽上传文件</p>
        <p className="mt-1 text-xs text-muted-foreground">{hint ?? accept}</p>
        <input
          ref={inputRef} type="file" accept={accept} multiple={multiple} className="hidden"
          onChange={(e) => { handleFiles(e.target.files); e.target.value = ""; }}
        />
      </div>
      {files.length > 0 && (
        <ul className="space-y-1.5">
          {files.map((f, i) => (
            <li key={i} className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm">
              <FileIcon size={14} className="text-muted-foreground shrink-0" />
              <span className="min-w-0 flex-1 truncate">{f.name}</span>
              <span className="shrink-0 text-xs text-muted-foreground">{(f.size / 1024).toFixed(1)} KB</span>
              {multiple && files.length > 1 && (
                <div className="flex gap-1">
                  <button type="button" onClick={(e) => { e.stopPropagation(); move(i, -1); }}
                    className="text-xs px-1.5 py-0.5 rounded border border-border hover:bg-muted disabled:opacity-30" disabled={i === 0}>↑</button>
                  <button type="button" onClick={(e) => { e.stopPropagation(); move(i, 1); }}
                    className="text-xs px-1.5 py-0.5 rounded border border-border hover:bg-muted disabled:opacity-30" disabled={i === files.length - 1}>↓</button>
                </div>
              )}
              <button type="button" onClick={(e) => { e.stopPropagation(); remove(i); }}
                className="text-muted-foreground hover:text-destructive shrink-0"><X size={14} /></button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
