// Submit-for-consultation modal
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { Lang } from "@/lib/solution-builder/i18n";

export type SubmissionForm = {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  organization_name: string;
  customer_city: string;
  customer_budget: string;
  customer_timeline: string;
  customer_notes: string;
};

export function SubmitDialog({
  open, onOpenChange, lang, onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  lang: Lang;
  onSubmit: (form: SubmissionForm) => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState<SubmissionForm>({
    customer_name: "", customer_email: "", customer_phone: "",
    organization_name: "", customer_city: "", customer_budget: "",
    customer_timeline: "", customer_notes: "",
  });

  const t = (zh: string, en: string) => (lang === "zh" ? zh : en);
  function set<K extends keyof SubmissionForm>(k: K, v: string) { setForm((f) => ({ ...f, [k]: v })); }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("提交方案并咨询", "Submit for Consultation")}</DialogTitle>
          <DialogDescription>
            {t(
              "填写您的联系方式，我们会在确认需求后与您联系。所有字段均可选。",
              "Share your contact info. All fields are optional.",
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input placeholder={t("姓名", "Name")} value={form.customer_name} onChange={(e) => set("customer_name", e.target.value)} maxLength={200} />
          <Input type="email" placeholder={t("邮箱", "Email")} value={form.customer_email} onChange={(e) => set("customer_email", e.target.value)} maxLength={200} />
          <Input placeholder={t("电话", "Phone")} value={form.customer_phone} onChange={(e) => set("customer_phone", e.target.value)} maxLength={60} />
          <Input placeholder={t("公司或组织", "Company / Organization")} value={form.organization_name} onChange={(e) => set("organization_name", e.target.value)} maxLength={200} />
          <Input placeholder={t("所在城市", "City")} value={form.customer_city} onChange={(e) => set("customer_city", e.target.value)} maxLength={200} />
          <Input placeholder={t("预计预算", "Estimated Budget")} value={form.customer_budget} onChange={(e) => set("customer_budget", e.target.value)} maxLength={200} />
          <Input placeholder={t("希望完成时间", "Preferred Timeline")} value={form.customer_timeline} onChange={(e) => set("customer_timeline", e.target.value)} maxLength={200} className="md:col-span-2" />
          <Textarea placeholder={t("补充说明", "Notes")} value={form.customer_notes} onChange={(e) => set("customer_notes", e.target.value)} maxLength={4000} rows={3} className="md:col-span-2" />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t("取消", "Cancel")}</Button>
          <Button
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try { await onSubmit(form); } finally { setBusy(false); }
            }}
          >
            {busy ? t("提交中…", "Submitting…") : t("提交方案", "Submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
