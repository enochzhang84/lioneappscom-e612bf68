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
  config: Record<string, any>;     // raw user selections
  items: LineItem[];
  computed: Record<string, any>;   // derived outputs (power, raid, etc.)
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
  brand_id: string | null;
  model: string | null;
  product_code: string | null;
  sku: string | null;
  description_zh: string | null;
  description_en: string | null;
  short_description_zh: string | null;
  short_description_en: string | null;
  image_url: string | null;
  manufacturer_url: string | null;
  builder_types: string[];
  usage_tags: string[];
  specs: Record<string, any>;
  list_price: number;
  cost_price?: number;                 // admin only; never returned to public
  install_fee: number;
  monthly_fee: number;
  annual_fee: number;
  stock_status: "in_stock" | "special_order" | "out_of_stock" | "discontinued";
  stock_quantity: number | null;
  lead_time_days: number | null;
  warranty_months: number | null;
  is_visible: boolean;
  is_sample: boolean;
  sort_order: number;
  currency: string;
  price_updated_at: string;
  deleted_at?: string | null;
};

export type SbBrand = {
  id: string;
  brand_code: string;
  name: string;
  name_zh: string | null;
  name_en: string | null;
  logo_url: string | null;
  website_url: string | null;
  country: string | null;
  description: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type SbCategory = {
  id: string;
  builder_type: "pc" | "nas" | "home-network" | "shared" | "service";
  code: string;
  name_zh: string;
  name_en: string;
  parent_code: string | null;
  icon: string | null;
  description: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type SbPriceHistoryRow = {
  id: string;
  product_id: string;
  field: string;
  old_value: number | null;
  new_value: number | null;
  currency: string;
  changed_by: string | null;
  changed_at: string;
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
  config: Record<string, any>;
  computed: Record<string, any>;
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
