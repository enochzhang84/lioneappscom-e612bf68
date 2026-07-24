
-- 1) Brands
CREATE TABLE public.solution_product_brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_code text NOT NULL UNIQUE,
  name text NOT NULL,
  name_zh text,
  name_en text,
  logo_url text,
  website_url text,
  country text,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.solution_product_brands TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.solution_product_brands TO authenticated;
GRANT ALL ON public.solution_product_brands TO service_role;
ALTER TABLE public.solution_product_brands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "brands public read active" ON public.solution_product_brands
  FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "brands admin read all" ON public.solution_product_brands
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "brands admin write" ON public.solution_product_brands
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER solution_product_brands_set_updated_at
  BEFORE UPDATE ON public.solution_product_brands
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 2) Categories
CREATE TABLE public.solution_product_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  builder_type text NOT NULL CHECK (builder_type IN ('pc','nas','home-network','shared','service')),
  code text NOT NULL,
  name_zh text NOT NULL,
  name_en text NOT NULL,
  parent_code text,
  icon text,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (builder_type, code)
);
GRANT SELECT ON public.solution_product_categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.solution_product_categories TO authenticated;
GRANT ALL ON public.solution_product_categories TO service_role;
ALTER TABLE public.solution_product_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories public read active" ON public.solution_product_categories
  FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "categories admin read all" ON public.solution_product_categories
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "categories admin write" ON public.solution_product_categories
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER solution_product_categories_set_updated_at
  BEFORE UPDATE ON public.solution_product_categories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3) Extend sb_products
ALTER TABLE public.sb_products
  ADD COLUMN IF NOT EXISTS product_code text,
  ADD COLUMN IF NOT EXISTS sku text,
  ADD COLUMN IF NOT EXISTS brand_id uuid REFERENCES public.solution_product_brands(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS builder_types text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS short_description_zh text,
  ADD COLUMN IF NOT EXISTS short_description_en text,
  ADD COLUMN IF NOT EXISTS manufacturer_url text,
  ADD COLUMN IF NOT EXISTS usage_tags text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS monthly_fee numeric(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS annual_fee numeric(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS stock_quantity integer,
  ADD COLUMN IF NOT EXISTS lead_time_days integer,
  ADD COLUMN IF NOT EXISTS warranty_months integer,
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

CREATE UNIQUE INDEX IF NOT EXISTS sb_products_product_code_key
  ON public.sb_products (product_code) WHERE product_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_sb_products_brand ON public.sb_products (brand_id);
CREATE INDEX IF NOT EXISTS idx_sb_products_builder_types ON public.sb_products USING gin (builder_types);
CREATE INDEX IF NOT EXISTS idx_sb_products_usage_tags ON public.sb_products USING gin (usage_tags);
CREATE INDEX IF NOT EXISTS idx_sb_products_deleted ON public.sb_products (deleted_at);

-- Update public policy so soft-deleted products are hidden
DROP POLICY IF EXISTS "sb_products public read visible" ON public.sb_products;
CREATE POLICY "sb_products public read visible" ON public.sb_products
  FOR SELECT TO anon, authenticated
  USING (is_visible = true AND deleted_at IS NULL);

-- 4) Price history
CREATE TABLE public.solution_price_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.sb_products(id) ON DELETE CASCADE,
  field text NOT NULL,          -- list_price | cost_price | install_fee | monthly_fee | annual_fee
  old_value numeric(12,2),
  new_value numeric(12,2),
  currency text NOT NULL DEFAULT 'USD',
  changed_by uuid,
  changed_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.solution_price_history TO authenticated;
GRANT ALL ON public.solution_price_history TO service_role;
ALTER TABLE public.solution_price_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "price_history admin read" ON public.solution_price_history
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "price_history admin write" ON public.solution_price_history
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE INDEX idx_price_history_product ON public.solution_price_history (product_id, changed_at DESC);

-- 5) Trigger: capture price changes
CREATE OR REPLACE FUNCTION public.sb_products_capture_price_history()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
BEGIN
  IF NEW.list_price IS DISTINCT FROM OLD.list_price THEN
    INSERT INTO public.solution_price_history(product_id, field, old_value, new_value, currency, changed_by)
      VALUES (NEW.id, 'list_price', OLD.list_price, NEW.list_price, NEW.currency, uid);
    NEW.price_updated_at := now();
  END IF;
  IF NEW.cost_price IS DISTINCT FROM OLD.cost_price THEN
    INSERT INTO public.solution_price_history(product_id, field, old_value, new_value, currency, changed_by)
      VALUES (NEW.id, 'cost_price', OLD.cost_price, NEW.cost_price, NEW.currency, uid);
  END IF;
  IF NEW.install_fee IS DISTINCT FROM OLD.install_fee THEN
    INSERT INTO public.solution_price_history(product_id, field, old_value, new_value, currency, changed_by)
      VALUES (NEW.id, 'install_fee', OLD.install_fee, NEW.install_fee, NEW.currency, uid);
  END IF;
  IF NEW.monthly_fee IS DISTINCT FROM OLD.monthly_fee THEN
    INSERT INTO public.solution_price_history(product_id, field, old_value, new_value, currency, changed_by)
      VALUES (NEW.id, 'monthly_fee', OLD.monthly_fee, NEW.monthly_fee, NEW.currency, uid);
  END IF;
  IF NEW.annual_fee IS DISTINCT FROM OLD.annual_fee THEN
    INSERT INTO public.solution_price_history(product_id, field, old_value, new_value, currency, changed_by)
      VALUES (NEW.id, 'annual_fee', OLD.annual_fee, NEW.annual_fee, NEW.currency, uid);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER sb_products_price_history
  BEFORE UPDATE ON public.sb_products
  FOR EACH ROW EXECUTE FUNCTION public.sb_products_capture_price_history();

-- 6) Seed brands (idempotent)
INSERT INTO public.solution_product_brands (brand_code, name, name_en, country, sort_order) VALUES
  ('intel','Intel','Intel','US',10),
  ('amd','AMD','AMD','US',20),
  ('nvidia','NVIDIA','NVIDIA','US',30),
  ('asus','ASUS','ASUS','TW',40),
  ('msi','MSI','MSI','TW',50),
  ('gigabyte','Gigabyte','Gigabyte','TW',60),
  ('asrock','ASRock','ASRock','TW',70),
  ('corsair','Corsair','Corsair','US',80),
  ('kingston','Kingston','Kingston','US',90),
  ('crucial','Crucial','Crucial','US',100),
  ('gskill','G.Skill','G.Skill','TW',110),
  ('teamgroup','TeamGroup','TeamGroup','TW',120),
  ('zotac','Zotac','Zotac','HK',130),
  ('pny','PNY','PNY','US',140),
  ('sapphire','Sapphire','Sapphire','HK',150),
  ('powercolor','PowerColor','PowerColor','TW',160),
  ('nzxt','NZXT','NZXT','US',170),
  ('fractal','Fractal Design','Fractal Design','SE',180),
  ('lianli','Lian Li','Lian Li','TW',190),
  ('coolermaster','Cooler Master','Cooler Master','TW',200),
  ('thermaltake','Thermaltake','Thermaltake','TW',210),
  ('bequiet','be quiet!','be quiet!','DE',220),
  ('noctua','Noctua','Noctua','AT',230),
  ('deepcool','DeepCool','DeepCool','CN',240),
  ('arctic','Arctic','Arctic','CH',250),
  ('thermalright','Thermalright','Thermalright','CN',260),
  ('seasonic','Seasonic','Seasonic','TW',270),
  ('evga','EVGA','EVGA','US',280),
  ('samsung','Samsung','Samsung','KR',290),
  ('wd','Western Digital','Western Digital','US',300),
  ('seagate','Seagate','Seagate','US',310),
  ('skhynix','SK hynix','SK hynix','KR',320),
  ('solidigm','Solidigm','Solidigm','US',330),
  ('toshiba','Toshiba','Toshiba','JP',340),
  ('synology','Synology','Synology','TW',350),
  ('qnap','QNAP','QNAP','TW',360),
  ('asustor','Asustor','Asustor','TW',370),
  ('terramaster','TerraMaster','TerraMaster','CN',380),
  ('ugreen','UGREEN','UGREEN','CN',390),
  ('truenas','TrueNAS','TrueNAS','US',400),
  ('ubiquiti','Ubiquiti','Ubiquiti','US',410),
  ('unifi','UniFi','UniFi','US',420),
  ('tplink','TP-Link','TP-Link','CN',430),
  ('netgear','Netgear','Netgear','US',440),
  ('eero','Eero','Eero','US',450),
  ('googlenest','Google Nest','Google Nest','US',460),
  ('cisco','Cisco','Cisco','US',470),
  ('mikrotik','MikroTik','MikroTik','LV',480),
  ('aruba','Aruba','Aruba','US',490),
  ('apc','APC','APC','US',500),
  ('cyberpower','CyberPower','CyberPower','US',510),
  ('eaton','Eaton','Eaton','IE',520),
  ('tripplite','Tripp Lite','Tripp Lite','US',530)
ON CONFLICT (brand_code) DO NOTHING;

-- 7) Seed categories (idempotent)
INSERT INTO public.solution_product_categories (builder_type, code, name_zh, name_en, sort_order) VALUES
  ('pc','pc-cpu','CPU','CPU',10),
  ('pc','pc-mb','主板','Motherboard',20),
  ('pc','pc-ram','内存','Memory',30),
  ('pc','pc-gpu','显卡','GPU',40),
  ('pc','pc-ssd','SSD','SSD',50),
  ('pc','pc-hdd','HDD','HDD',60),
  ('pc','pc-psu','电源','Power Supply',70),
  ('pc','pc-case','机箱','Case',80),
  ('pc','pc-cooler','CPU 散热器','CPU Cooler',90),
  ('pc','pc-fan','机箱风扇','Case Fan',100),
  ('pc','pc-os','操作系统','Operating System',110),
  ('pc','pc-monitor','显示器','Monitor',120),
  ('pc','pc-keyboard','键盘','Keyboard',130),
  ('pc','pc-mouse','鼠标','Mouse',140),
  ('pc','pc-wifi','无线网卡','Wireless NIC',150),
  ('nas','nas-host','NAS 主机','NAS Unit',10),
  ('nas','nas-case','NAS 机箱','NAS Case',20),
  ('nas','nas-hdd','NAS 硬盘','NAS HDD',30),
  ('nas','nas-ssd','NAS SSD','NAS SSD',40),
  ('nas','nas-ram','NAS 内存','NAS Memory',50),
  ('nas','nas-cache','缓存 SSD','Cache SSD',60),
  ('nas','nas-10gbe','10GbE 网卡','10GbE NIC',70),
  ('nas','nas-2gbe','2.5GbE 网卡','2.5GbE NIC',80),
  ('nas','nas-expansion','扩展柜','Expansion Unit',90),
  ('home-network','net-router','路由器','Router',10),
  ('home-network','net-mesh','Mesh 路由器','Mesh Router',20),
  ('home-network','net-mesh-node','Mesh 节点','Mesh Node',30),
  ('home-network','net-ap','无线 AP','Wireless AP',40),
  ('home-network','net-controller','控制器','Controller',50),
  ('home-network','net-switch','交换机','Switch',60),
  ('home-network','net-poe','PoE 交换机','PoE Switch',70),
  ('home-network','net-gateway','网关','Gateway',80),
  ('home-network','net-firewall','防火墙','Firewall',90),
  ('home-network','net-cable','网线','Cable',100),
  ('home-network','net-patch','配线架','Patch Panel',110),
  ('home-network','net-faceplate','墙面面板','Wall Plate',120),
  ('home-network','net-rack','网络机柜','Rack',130),
  ('home-network','net-sfp','SFP 模块','SFP Module',140),
  ('shared','ups','UPS 不间断电源','UPS',10),
  ('service','service-install','安装服务','Installation Service',10),
  ('service','service-cabling','布线服务','Cabling Service',20),
  ('service','service-backup','备份服务','Backup Service',30),
  ('service','service-config','配置服务','Configuration Service',40)
ON CONFLICT (builder_type, code) DO NOTHING;
