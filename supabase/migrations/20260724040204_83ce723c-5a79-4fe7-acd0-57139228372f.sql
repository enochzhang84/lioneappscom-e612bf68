
-- ============ Extend blog_posts with bilingual + operational columns ============
ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS title_zh text,
  ADD COLUMN IF NOT EXISTS title_en text,
  ADD COLUMN IF NOT EXISTS slug_en text,
  ADD COLUMN IF NOT EXISTS excerpt_zh text,
  ADD COLUMN IF NOT EXISTS excerpt_en text,
  ADD COLUMN IF NOT EXISTS content_zh text,
  ADD COLUMN IF NOT EXISTS content_en text,
  ADD COLUMN IF NOT EXISTS cover_alt_zh text,
  ADD COLUMN IF NOT EXISTS cover_alt_en text,
  ADD COLUMN IF NOT EXISTS seo_title_zh text,
  ADD COLUMN IF NOT EXISTS seo_title_en text,
  ADD COLUMN IF NOT EXISTS meta_description_zh text,
  ADD COLUMN IF NOT EXISTS meta_description_en text,
  ADD COLUMN IF NOT EXISTS reading_time integer,
  ADD COLUMN IF NOT EXISTS og_image_url text,
  ADD COLUMN IF NOT EXISTS scheduled_at timestamptz,
  ADD COLUMN IF NOT EXISTS allow_comments boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
  ADD COLUMN IF NOT EXISTS category_id uuid;

-- Backfill zh fields from legacy single-language columns
UPDATE public.blog_posts
SET title_zh = COALESCE(title_zh, title),
    excerpt_zh = COALESCE(excerpt_zh, excerpt),
    content_zh = COALESCE(content_zh, content)
WHERE title_zh IS NULL OR excerpt_zh IS NULL OR content_zh IS NULL;

-- ============ blog_categories ============
CREATE TABLE IF NOT EXISTS public.blog_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name_zh text NOT NULL,
  name_en text NOT NULL,
  description_zh text,
  description_en text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.blog_categories TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.blog_categories TO authenticated;
GRANT ALL ON public.blog_categories TO service_role;
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read active categories" ON public.blog_categories;
CREATE POLICY "Public read active categories" ON public.blog_categories
  FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "Admins manage categories" ON public.blog_categories;
CREATE POLICY "Admins manage categories" ON public.blog_categories
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));
DROP TRIGGER IF EXISTS blog_categories_updated_at ON public.blog_categories;
CREATE TRIGGER blog_categories_updated_at BEFORE UPDATE ON public.blog_categories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ blog_tags ============
CREATE TABLE IF NOT EXISTS public.blog_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name_zh text NOT NULL,
  name_en text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.blog_tags TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.blog_tags TO authenticated;
GRANT ALL ON public.blog_tags TO service_role;
ALTER TABLE public.blog_tags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read tags" ON public.blog_tags;
CREATE POLICY "Public read tags" ON public.blog_tags FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins manage tags" ON public.blog_tags;
CREATE POLICY "Admins manage tags" ON public.blog_tags
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============ blog_post_tags ============
CREATE TABLE IF NOT EXISTS public.blog_post_tags (
  post_id uuid NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES public.blog_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);
GRANT SELECT ON public.blog_post_tags TO anon, authenticated;
GRANT INSERT, DELETE ON public.blog_post_tags TO authenticated;
GRANT ALL ON public.blog_post_tags TO service_role;
ALTER TABLE public.blog_post_tags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read post_tags" ON public.blog_post_tags;
CREATE POLICY "Public read post_tags" ON public.blog_post_tags FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins manage post_tags" ON public.blog_post_tags;
CREATE POLICY "Admins manage post_tags" ON public.blog_post_tags
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

-- FK from blog_posts to blog_categories (nullable)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'blog_posts_category_id_fkey'
  ) THEN
    ALTER TABLE public.blog_posts
      ADD CONSTRAINT blog_posts_category_id_fkey
      FOREIGN KEY (category_id) REFERENCES public.blog_categories(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS blog_posts_status_pub_idx ON public.blog_posts(status, published_at DESC);
CREATE INDEX IF NOT EXISTS blog_posts_category_idx ON public.blog_posts(category_id);
CREATE INDEX IF NOT EXISTS blog_posts_featured_idx ON public.blog_posts(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS blog_posts_deleted_idx ON public.blog_posts(deleted_at);

-- Update public-read policy to exclude soft-deleted
DROP POLICY IF EXISTS "Public read published posts" ON public.blog_posts;
CREATE POLICY "Public read published posts" ON public.blog_posts
  FOR SELECT USING (status = 'published' AND deleted_at IS NULL);

-- ============ Seed default categories ============
INSERT INTO public.blog_categories (slug, name_zh, name_en, sort_order) VALUES
  ('home-network', '家庭网络', 'Home Network', 10),
  ('nas', 'NAS 与私有云', 'NAS & Private Cloud', 20),
  ('smart-home', '智能家居', 'Smart Home', 30),
  ('home-media', '家庭影音', 'Home Media', 40),
  ('business-websites', '企业网站', 'Business Websites', 50),
  ('custom-software', '定制软件', 'Custom Software', 60),
  ('office-platforms', '办公平台', 'Office Platforms', 70),
  ('cloud-servers', '云服务器', 'Cloud Servers', 80),
  ('tutorials', '技术教程', 'Tutorials', 90),
  ('project-stories', '项目经验', 'Project Stories', 100)
ON CONFLICT (slug) DO NOTHING;

-- ============ Seed 3 draft sample posts (bilingual, draft only) ============
INSERT INTO public.blog_posts (
  slug, title, title_zh, title_en, excerpt_zh, excerpt_en,
  content_zh, content_en, status, category_id, reading_time, content
) VALUES
(
  'why-modern-homes-need-whole-home-wifi',
  '为什么现代家庭需要稳定的全屋 Wi-Fi',
  '为什么现代家庭需要稳定的全屋 Wi-Fi',
  'Why Modern Homes Need Reliable Whole-Home Wi-Fi',
  '手机、电视、摄像头和智能设备越来越多，一台普通路由器已经无法应付。本文介绍 Mesh 与合理规划的价值。',
  'With phones, TVs, cameras and smart devices multiplying, a single router no longer suffices. Here is why Mesh planning matters.',
  E'## 为什么全屋 Wi-Fi 越来越重要\n\n现代家庭同时连接手机、笔记本、电视、摄像头、游戏机与智能设备。普通路由器难以保证全屋覆盖。\n\n## Mesh 的优势\n\n- 多节点无缝漫游\n- 消除死角\n- 支持有线回程\n\n## 建议\n\n对于两层以上或超过 120 平米的住宅，Mesh 通常是首选。',
  E'## Why Whole-Home Wi-Fi Matters\n\nToday households connect phones, laptops, TVs, cameras, consoles and smart devices simultaneously. A basic router rarely covers every room reliably.\n\n## Mesh Advantages\n\n- Seamless roaming\n- No dead zones\n- Wired backhaul supported\n\n## Recommendation\n\nFor two-story homes or over 1200 sqft, Mesh is usually the right choice.',
  'draft',
  (SELECT id FROM public.blog_categories WHERE slug='home-network'),
  4,
  '为什么现代家庭需要稳定的全屋 Wi-Fi'
),
(
  'which-families-benefit-from-nas',
  'NAS 私有云适合哪些家庭',
  'NAS 私有云适合哪些家庭',
  'Which Families Benefit from a NAS Private Cloud',
  '家庭照片、视频和文件不断增长，NAS 提供自动备份、共享和远程访问的私有云方案。',
  'As photos, videos and documents grow, a NAS offers backup, sharing and remote access as your private cloud.',
  E'## 什么家庭最需要 NAS\n\n- 多口人共同使用照片\n- 有大量家庭视频\n- 关心隐私，不希望依赖公共云\n- 想在电视上直接播放媒体\n\n## 常见配置\n\n入门 2 盘位 NAS + 两块 4TB HDD 已能满足大部分家庭。',
  E'## Who Benefits Most\n\n- Families sharing photos across members\n- Households with large home video libraries\n- Privacy-conscious users avoiding public clouds\n- People who stream media on their TV\n\n## Typical Setup\n\nAn entry-level 2-bay NAS with two 4TB HDDs meets most family needs.',
  'draft',
  (SELECT id FROM public.blog_categories WHERE slug='nas'),
  5,
  'NAS 私有云适合哪些家庭'
),
(
  'why-small-businesses-need-a-management-system',
  '小型企业为什么需要自己的管理系统',
  '小型企业为什么需要自己的管理系统',
  'Why Small Businesses Need Their Own Management System',
  '通用 SaaS 通常无法完美贴合业务流程。定制管理系统让流程、数据和成本都掌握在自己手中。',
  'Off-the-shelf SaaS rarely fits every workflow. A custom management system keeps process, data and cost under your control.',
  E'## 通用工具的问题\n\n- 功能过多但用不上\n- 每月订阅费不断上涨\n- 数据难以迁移\n\n## 定制系统的价值\n\n- 贴合业务流程\n- 数据留在自己手中\n- 长期成本更可控',
  E'## Limits of Generic Tools\n\n- Too many unused features\n- Subscription costs keep rising\n- Data lock-in\n\n## Value of Custom Systems\n\n- Matches your workflow exactly\n- You own the data\n- Predictable long-term cost',
  'draft',
  (SELECT id FROM public.blog_categories WHERE slug='custom-software'),
  4,
  '小型企业为什么需要自己的管理系统'
)
ON CONFLICT (slug) DO NOTHING;
