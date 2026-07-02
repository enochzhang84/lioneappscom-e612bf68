import { type ReactNode } from "react";
import { Inbox } from "lucide-react";

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-md bg-white border border-dashed border-slate-300 rounded-2xl p-10 text-center">
      <div className="inline-flex h-12 w-12 rounded-2xl bg-slate-50 text-slate-400 items-center justify-center mb-4">
        {icon ?? <Inbox size={22} />}
      </div>
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      {description && <p className="text-sm text-slate-500 mt-1.5">{description}</p>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}
