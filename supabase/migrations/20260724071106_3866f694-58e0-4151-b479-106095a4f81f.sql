-- M11: expand compatibility rule seeds

INSERT INTO public.solution_compatibility_rules
  (rule_code, rule_type, params, severity, message_zh, message_en, is_active, sort_order)
VALUES
  ('pc_case_form_factor', 'pc.case_form_factor', '{}'::jsonb, 'warning',
   '主板板型与机箱不兼容', 'Motherboard form factor is not supported by the case', true, 20),
  ('pc_m2_slot_capacity', 'pc.m2_slot_count', '{}'::jsonb, 'warning',
   'M.2 硬盘数量超过主板 M.2 插槽数', 'M.2 SSD count exceeds motherboard M.2 slots', true, 21),
  ('pc_gpu_length_fit', 'pc.gpu_length', '{}'::jsonb, 'warning',
   '显卡长度超过机箱允许的最大长度', 'GPU length exceeds the case maximum', true, 22),
  ('nas_bay_capacity', 'nas.bay_capacity', '{}'::jsonb, 'error',
   '硬盘数量超过 NAS 机身可用盘位', 'Disk count exceeds available NAS bays', true, 30),
  ('net_ap_coverage', 'net.ap_coverage', '{"sqft_per_ap":1500}'::jsonb, 'info',
   '建议根据覆盖面积增加无线 AP', 'Consider adding more APs based on coverage area', true, 40),
  ('net_wifi_gen_10g', 'net.wifi_gen_for_10g', '{"min_gen":6}'::jsonb, 'info',
   '10GbE 环境建议 Wi-Fi 6 及以上路由器', 'For 10GbE, use Wi-Fi 6 or newer routers', true, 41)
ON CONFLICT (rule_code) DO NOTHING;