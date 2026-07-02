import { cn } from "@/lib/utils";

export type ExamOptionKey = "A" | "B" | "C" | "D";

export type ExamOption = {
  key: ExamOptionKey;
  text?: string | null;
  textEn?: string | null;
};

type Props = {
  options: ExamOption[];
  selected?: ExamOptionKey | null;
  onSelect?: (key: ExamOptionKey) => void;
  showTranslation?: boolean;
  /** Read-only mode for review screens. */
  readOnly?: boolean;
  /** Optional per-option state overrides (for result review). */
  stateFor?: (key: ExamOptionKey) => "correct" | "wrong" | "neutral";
};

/**
 * Unified vertical option list for all DMV exam question types.
 * Always renders one option per row (A/B/C/D) — never a horizontal grid.
 */
export function ExamOptionList({
  options,
  selected,
  onSelect,
  showTranslation = false,
  readOnly = false,
  stateFor,
}: Props) {
  return (
    <div className="space-y-3">
      {options.map(({ key, text, textEn }) => {
        const isSelected = selected === key;
        const state = stateFor?.(key) ?? "neutral";
        const showEn = (showTranslation || !!textEn) && !!textEn;
        const hasText = !!text && text.trim() !== "";

        const stateBorder =
          state === "correct"
            ? "border-emerald-500 bg-emerald-50 shadow-[0_0_0_3px_rgba(16,185,129,0.12)]"
            : state === "wrong"
              ? "border-rose-500 bg-rose-50 shadow-[0_0_0_3px_rgba(244,63,94,0.12)]"
              : isSelected
                ? "border-blue-500 bg-blue-50 shadow-[0_0_0_3px_rgba(37,99,235,0.12)]"
                : "border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/40";

        const dotClass =
          state === "correct"
            ? "bg-emerald-600 border-emerald-600 text-white"
            : state === "wrong"
              ? "bg-rose-600 border-rose-600 text-white"
              : isSelected
                ? "bg-blue-600 border-blue-600 text-white"
                : "border-slate-300 bg-white";

        return (
          <button
            key={key}
            type="button"
            disabled={readOnly}
            onClick={() => !readOnly && onSelect?.(key)}
            className={cn(
              "w-full text-left rounded-xl border p-4 md:p-5 flex items-start gap-4 transition-all",
              stateBorder,
              readOnly && "cursor-default",
            )}
          >
            <span
              className={cn(
                "shrink-0 h-6 w-6 rounded-full grid place-items-center text-[11px] mt-0.5 border-2 transition-colors",
                dotClass,
              )}
            >
              {(isSelected || state !== "neutral") && (
                <span className="h-2 w-2 rounded-full bg-white" />
              )}
            </span>
            <div className="flex-1 min-w-0 flex gap-2">
              <span
                className={cn(
                  "font-semibold",
                  state === "correct"
                    ? "text-emerald-700"
                    : state === "wrong"
                      ? "text-rose-700"
                      : isSelected
                        ? "text-blue-700"
                        : "text-slate-700",
                )}
              >
                {key}.
              </span>
              <div className="min-w-0 flex-1">
                {hasText ? (
                  <div
                    className={cn(
                      "text-sm md:text-base leading-relaxed whitespace-pre-wrap",
                      isSelected || state !== "neutral" ? "text-slate-900" : "text-slate-700",
                    )}
                  >
                    {text}
                  </div>
                ) : (
                  <div className="text-sm md:text-base text-slate-400 italic">选项 {key}</div>
                )}
                {showEn && (
                  <div className="mt-1 text-xs md:text-sm text-slate-500 italic leading-relaxed whitespace-pre-wrap">
                    {textEn}
                  </div>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
