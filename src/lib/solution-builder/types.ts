// Solution Builder — shared types
export type ToolKey = "pc" | "nas" | "home-network" | "full-solution";

export type LineItem = {
  id: string;                // uuid or product slug
  kind: "product" | "service";
  category: string;          // pc-cpu, nas-drive, service-install, etc.
  name_zh: string;
  name_en: string;
  brand?: string;
  model?: string;
  qty: number;
  unit_price: number;        // captured at save time
  install_fee?: number;
  note?: string;
};

export type SolutionState = {
  tool: ToolKey;
  title: string;
  config: Record<string, unknown>;     // raw user selections
  items: LineItem[];
  computed: Record<string, unknown>;   // derived outputs (power, raid, etc.)
  compat_warnings: CompatWarning[];
};

export type CompatWarning = {
  level: "ok" | "notice" | "error";
  message_zh: string;
  message_en: string;
};

export type Totals = {
  subtotal: number;
  service_fee: number;
  tax_rate: number;
  tax_amount: number;
  discount: number;
  one_time_total: number;
  monthly_total: number;
  annual_total: number;
};

export type SbSettings = {
  currency: string;
  tax_rate: number;
  default_service_fee: number;
  margin_rate: number;
  discount_rate: number;
  proposal_validity_days: number;
  contact_email: string;
  contact_phone: string | null;
  disclaimer_zh: string;
  disclaimer_en: string;
};

export type SbProduct = {
  id: string;
  category: string;
  subcategory: string | null;
  slug: string;
  name_zh: string;
  name_en: string;
  brand: string | null;
  model: string | null;
  description_zh: string | null;
  description_en: string | null;
  image_url: string | null;
  specs: Record<string, unknown>;
  list_price: number;
  install_fee: number;
  stock_status: "in_stock" | "special_order" | "out_of_stock" | "discontinued";
  is_visible: boolean;
  is_sample: boolean;
  currency: string;
  price_updated_at: string;
};

export type SbSolutionRow = {
  id: string;
  solution_number: string;
  solution_type: ToolKey;
  title: string;
  language: string;
  currency: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  organization_name: string | null;
  customer_city: string | null;
  customer_budget: string | null;
  customer_timeline: string | null;
  customer_notes: string | null;
  subtotal: number;
  service_fee: number;
  tax_rate: number;
  tax_amount: number;
  discount: number;
  one_time_total: number;
  monthly_total: number;
  annual_total: number;
  items: LineItem[];
  config: Record<string, unknown>;
  computed: Record<string, unknown>;
  compat_warnings: CompatWarning[];
  status: "draft" | "submitted" | "contacted" | "quoted" | "accepted" | "rejected" | "completed" | "archived";
  source: string;
  admin_notes: string | null;
  share_token: string | null;
  share_expires_at: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
};

export const SOLUTION_STATUSES = ["draft","submitted","contacted","quoted","accepted","rejected","completed","archived"] as const;
