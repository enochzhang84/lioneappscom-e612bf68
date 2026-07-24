import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { TOOL_META, SB_STRINGS, bi } from "@/lib/solution-builder/i18n";
import { useLang } from "@/lib/i18n";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/tools/solution-builder/")({
  component: SolutionBuilderHub,
});

function SolutionBuilderHub() {
  const { lang } = useLang();
  const L = lang === "en" ? "en" : "zh";
  const tools = (["pc", "nas", "home-network", "full-solution"] as const).map((k) => ({ key: k, ...TOOL_META[k] }));

  return (
    <SiteLayout>
      <section className="bg-gradient-to-b from-blue-50/60 via-white to-[#F8F7F3] border-b">
        <div className="mx-auto max-w-6xl px-4 md:px-6 py-16 md:py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-3 py-1 text-xs text-blue-700">
              {bi(SB_STRINGS.brand, L)}
            </div>
            <h1 className="mt-4 text-3xl md:text-5xl font-bold text-slate-900 leading-tight">
              {bi(SB_STRINGS.hero_title, L)}
            </h1>
            <p className="mt-4 text-base md:text-lg text-slate-600 leading-relaxed">
              {bi(SB_STRINGS.hero_sub, L)}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/tools/solution-builder/pc">
                  {bi(SB_STRINGS.cta_start, L)} <ArrowRight size={16} className="ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/tools/solution-builder/full-solution">
                  {L === "zh" ? "配置完整方案" : "Complete Solution"}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 md:px-6 py-14 md:py-16">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-2">
          {tools.map((t) => (
            <Link
              key={t.key}
              to={t.path}
              className="group bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-lg transition p-6 flex flex-col"
            >
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center text-2xl shrink-0">
                  {t.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-lg font-semibold text-slate-900 group-hover:text-blue-700">
                    {t.title[L]}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">{t.audience[L]}</div>
                </div>
              </div>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">{t.intro[L]}</p>
              <div className="mt-4 pt-4 border-t border-slate-100 text-sm text-blue-600 font-medium inline-flex items-center gap-1">
                {L === "zh" ? "开始配置" : "Start"} <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-xs text-slate-400 text-center">
          {bi(SB_STRINGS.disclaimer_short, L)}
        </div>
      </section>
    </SiteLayout>
  );
}
