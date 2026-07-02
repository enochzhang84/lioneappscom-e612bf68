import * as React from "react";
import { Car, Gauge, Fuel, Wallet, ArrowLeftRight } from "lucide-react";
import { UnitConverterByKey } from "@/components/converter/UnitConverter";
import { CalculatorByKey } from "@/components/calculator/Calculator";

type Tab = {
  key: string;
  label: string;
  icon: React.ReactNode;
  hint: string;
  render: () => React.ReactElement;
};

const TABS: Tab[] = [
  {
    key: "speed",
    label: "速度换算",
    hint: "MPH ⇄ KM/H ⇄ m/s",
    icon: <Gauge size={16} />,
    render: () => <UnitConverterByKey configKey="speed-kmh" />,
  },
  {
    key: "fuel",
    label: "油耗换算",
    hint: "MPG ⇄ L/100km",
    icon: <Fuel size={16} />,
    render: () => <UnitConverterByKey configKey="fuel-l100km" />,
  },
  {
    key: "pressure",
    label: "胎压换算",
    hint: "PSI ⇄ BAR ⇄ kPa",
    icon: <ArrowLeftRight size={16} />,
    render: () => <UnitConverterByKey configKey="pressure-psi" />,
  },
  {
    key: "cost",
    label: "油费计算器",
    hint: "里程 + 油耗 + 油价 → 总油费",
    icon: <Wallet size={16} />,
    render: () => <CalculatorByKey configKey="auto-fuel-cost" />,
  },
];

export function AutomotiveHub() {
  const [active, setActive] = React.useState<string>(TABS[0].key);
  const current = TABS.find((t) => t.key === active) ?? TABS[0];

  return (
    <div className="mx-auto max-w-3xl px-4 md:px-6 py-6 md:py-10 space-y-6">
      <header>
        <div className="inline-flex items-center gap-2 text-xs text-primary font-medium mb-3">
          <Car size={12} /> 汽车换算工具
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">汽车换算工具</h1>
        <p className="mt-3 text-base md:text-lg text-muted-foreground leading-relaxed">
          汽车常用换算合集：速度 (MPH/KM/H)、油耗 (MPG/L·100km)、胎压 (PSI/BAR/kPa)，以及油费计算器，一站搞定。
        </p>
      </header>

      {/* Tab 栏 */}
      <nav className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {TABS.map((t) => {
          const isActive = t.key === active;
          return (
            <button
              key={t.key}
              onClick={() => setActive(t.key)}
              className={
                "text-left rounded-xl border p-3 transition-colors " +
                (isActive
                  ? "border-primary bg-primary/5 text-foreground"
                  : "border-border bg-card hover:border-primary/40 text-muted-foreground")
              }
            >
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                {t.icon}
                {t.label}
              </div>
              <div className="mt-1 text-[11px] leading-tight opacity-80">{t.hint}</div>
            </button>
          );
        })}
      </nav>

      {/* 内容区 —— 复用现有 UnitConverter / Calculator 组件 */}
      <div key={current.key}>
        {current.render()}
      </div>

    </div>
  );
}
