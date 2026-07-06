create table public.ai_usage_daily (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  feature_key text not null,
  usage_date date not null,
  count integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, feature_key, usage_date)
);

comment on table public.ai_usage_daily is 'AI 功能按用户按天用量统计';
comment on column public.ai_usage_daily.feature_key is 'AI 功能标识，如 dmv-c1-analysis';

grant select, insert, update on public.ai_usage_daily to authenticated;
grant all on public.ai_usage_daily to service_role;

alter table public.ai_usage_daily enable row level security;

create policy "Users can read their own AI usage"
  on public.ai_usage_daily
  for select
  to authenticated
  using (user_id = auth.uid());

create policy "Users can insert their own AI usage"
  on public.ai_usage_daily
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "Users can update their own AI usage"
  on public.ai_usage_daily
  for update
  to authenticated
  using (user_id = auth.uid());

create table public.ai_usage_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  feature_key text not null,
  question_id text,
  used_at timestamptz not null default now(),
  ip inet,
  user_agent text,
  metadata jsonb default '{}'::jsonb
);

comment on table public.ai_usage_logs is 'AI 功能单次调用审计日志';

grant select, insert on public.ai_usage_logs to authenticated;
grant all on public.ai_usage_logs to service_role;

alter table public.ai_usage_logs enable row level security;

create policy "Users can read their own AI usage logs"
  on public.ai_usage_logs
  for select
  to authenticated
  using (user_id = auth.uid());

create policy "Users can insert their own AI usage logs"
  on public.ai_usage_logs
  for insert
  to authenticated
  with check (user_id = auth.uid());
