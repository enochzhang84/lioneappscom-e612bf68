import { useMemo, useState, type ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Search as SearchIcon,
} from "lucide-react";

export type DataTableColumn<T> = {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number | null | undefined;
  className?: string;
  width?: string;
};

export type BatchAction<T> = {
  label: string;
  onRun: (rows: T[]) => Promise<void> | void;
  variant?: "default" | "outline" | "destructive";
  confirm?: string;
};

type Props<T> = {
  rows: T[];
  columns: DataTableColumn<T>[];
  rowKey: (row: T) => string;
  searchable?: (row: T) => string;
  searchPlaceholder?: string;
  pageSize?: number;
  batchActions?: BatchAction<T>[];
  emptyText?: string;
  loading?: boolean;
  onRowClick?: (row: T) => void;
};

export function DataTable<T>({
  rows,
  columns,
  rowKey,
  searchable,
  searchPlaceholder = "搜索…",
  pageSize = 20,
  batchActions,
  emptyText = "暂无数据",
  loading,
  onRowClick,
}: Props<T>) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const filtered = useMemo(() => {
    if (!query.trim() || !searchable) return rows;
    const q = query.toLowerCase();
    return rows.filter((r) => searchable(r).toLowerCase().includes(q));
  }, [rows, query, searchable]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const col = columns.find((c) => c.key === sortKey);
    if (!col?.sortValue) return filtered;
    const copy = [...filtered];
    copy.sort((a, b) => {
      const va = col.sortValue!(a);
      const vb = col.sortValue!(b);
      if (va == null && vb == null) return 0;
      if (va == null) return 1;
      if (vb == null) return -1;
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return copy;
  }, [filtered, sortKey, sortDir, columns]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const selectedRows = sorted.filter((r) => selected[rowKey(r)]);
  const allOnPageSelected = paged.length > 0 && paged.every((r) => selected[rowKey(r)]);

  function toggleSort(key: string) {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir("asc");
    } else if (sortDir === "asc") {
      setSortDir("desc");
    } else {
      setSortKey(null);
    }
  }

  function toggleAllOnPage() {
    setSelected((prev) => {
      const next = { ...prev };
      if (allOnPageSelected) {
        for (const r of paged) delete next[rowKey(r)];
      } else {
        for (const r of paged) next[rowKey(r)] = true;
      }
      return next;
    });
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      {/* Toolbar */}
      <div className="p-3 border-b border-slate-100 flex flex-wrap items-center gap-2">
        {searchable && (
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <SearchIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder={searchPlaceholder}
              className="pl-9 h-9"
            />
          </div>
        )}

        {selectedRows.length > 0 && batchActions && batchActions.length > 0 && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-slate-500">已选 {selectedRows.length} 项</span>
            {batchActions.map((a, i) => (
              <Button
                key={i}
                size="sm"
                variant={a.variant ?? "outline"}
                onClick={async () => {
                  if (a.confirm && !window.confirm(a.confirm)) return;
                  await a.onRun(selectedRows);
                  setSelected({});
                }}
              >
                {a.label}
              </Button>
            ))}
          </div>
        )}

        <div className="ml-auto text-xs text-slate-500 tabular-nums">
          共 {sorted.length} 条{query && rows.length !== sorted.length && ` · 筛选自 ${rows.length}`}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider">
              {batchActions && (
                <th className="w-10 px-3 py-2.5 text-left">
                  <Checkbox
                    checked={allOnPageSelected}
                    onCheckedChange={toggleAllOnPage}
                  />
                </th>
              )}
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={cn("px-4 py-2.5 text-left font-medium", c.className)}
                  style={{ width: c.width }}
                >
                  {c.sortValue ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(c.key)}
                      className="inline-flex items-center gap-1 hover:text-slate-900"
                    >
                      {c.header}
                      {sortKey === c.key ? (
                        sortDir === "asc" ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                      ) : (
                        <ArrowUpDown size={12} className="opacity-50" />
                      )}
                    </button>
                  ) : (
                    c.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={columns.length + (batchActions ? 1 : 0)} className="text-center py-10 text-slate-400">
                  加载中…
                </td>
              </tr>
            )}
            {!loading && paged.length === 0 && (
              <tr>
                <td colSpan={columns.length + (batchActions ? 1 : 0)} className="text-center py-10 text-slate-400">
                  {emptyText}
                </td>
              </tr>
            )}
            {!loading &&
              paged.map((r) => {
                const key = rowKey(r);
                const isSel = !!selected[key];
                return (
                  <tr
                    key={key}
                    className={cn(
                      "border-t border-slate-100 hover:bg-slate-50/60",
                      onRowClick && "cursor-pointer",
                      isSel && "bg-blue-50/40",
                    )}
                    onClick={onRowClick ? () => onRowClick(r) : undefined}
                  >
                    {batchActions && (
                      <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={isSel}
                          onCheckedChange={() =>
                            setSelected((prev) => ({ ...prev, [key]: !prev[key] }))
                          }
                        />
                      </td>
                    )}
                    {columns.map((c) => (
                      <td key={c.key} className={cn("px-4 py-2.5 align-middle text-slate-700", c.className)}>
                        {c.cell(r)}
                      </td>
                    ))}
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500 tabular-nums">
            第 {currentPage} / {totalPages} 页
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft size={14} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
