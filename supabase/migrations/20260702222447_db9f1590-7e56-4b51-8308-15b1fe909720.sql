
INSERT INTO public.tool_items (page_id, category_id, slug, title, subtitle, description, link_url, status, sort_order)
SELECT '92057e7f-a815-4bbe-96fc-2e804037933e', 'a1000000-0000-4000-a000-000000000009', 't-fin-universal', '通用汇率换算器',
       '12 种主流货币互换 · 实时汇率 · 双向换算',
       '支持 USD、CNY、TWD、HKD、EUR、JPY、KRW、GBP、CAD、AUD、SGD、CHF 之间的实时换算。',
       'app:currency:universal', 'live',
       COALESCE((SELECT MAX(sort_order) FROM public.tool_items WHERE category_id='a1000000-0000-4000-a000-000000000009'),0) + 1
WHERE NOT EXISTS (SELECT 1 FROM public.tool_items WHERE slug='t-fin-universal');
