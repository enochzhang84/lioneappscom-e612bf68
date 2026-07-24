// Shared helpers used by builder route pages.
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { sbListProducts } from "@/lib/solution-builder.functions";
import type { LineItem, SbProduct } from "@/lib/solution-builder/types";

export function useProducts(categories: string[], builderType?: string) {
  const listFn = useServerFn(sbListProducts);
  return useQuery({
    queryKey: ["sb-products", categories.join(","), builderType ?? ""],
    queryFn: () => listFn({ data: { categories, builder_type: builderType } }),
    staleTime: 60_000,
  });
}


export function productToLineItem(p: SbProduct, qty = 1, category?: string): LineItem {
  return {
    id: p.id,
    kind: p.category.startsWith("service") ? "service" : "product",
    category: category ?? p.category,
    name_zh: p.name_zh,
    name_en: p.name_en,
    brand: p.brand ?? undefined,
    model: p.model ?? undefined,
    qty,
    unit_price: Number(p.list_price) || 0,
    install_fee: Number(p.install_fee) || 0,
  };
}

export function customLineItem(
  id: string,
  category: string,
  name: { zh: string; en: string },
  qty: number,
  unit_price: number,
  extra?: Partial<LineItem>
): LineItem {
  return {
    id,
    kind: category.startsWith("service") ? "service" : "product",
    category,
    name_zh: name.zh,
    name_en: name.en,
    qty,
    unit_price,
    ...extra,
  };
}

export function pickerOptions(products: SbProduct[] | undefined, category: string): SbProduct[] {
  return (products ?? []).filter((p) => p.category === category);
}

export function pickById(products: SbProduct[] | undefined, id: string | null): SbProduct | undefined {
  if (!id) return undefined;
  return (products ?? []).find((p) => p.id === id);
}

export function toStepList<T extends string>(keys: T[], labels: Record<T, { zh: string; en: string }>) {
  return keys.map((k) => ({ key: k, label: labels[k] }));
}

export function useLine(items: LineItem[]) {
  return useMemo(() => items.reduce((s, i) => s + i.qty * i.unit_price, 0), [items]);
}
