-- Run this once in Supabase SQL Editor.
-- It stores lesson comments and student watch progress in the cloud.

create table if not exists public.lesson_comments (
  id text primary key,
  lesson_id text not null,
  student_id text not null,
  student_name text not null,
  text text not null,
  created_at bigint not null
);

create index if not exists lesson_comments_lesson_created_idx
  on public.lesson_comments (lesson_id, created_at desc);

create index if not exists lesson_comments_student_created_idx
  on public.lesson_comments (student_id, created_at desc);

create table if not exists public.student_progress (
  student_id text primary key,
  current_lesson_id text not null,
  completed_lesson_ids jsonb not null default '[]'::jsonb,
  watch_progress_by_lesson_id jsonb not null default '{}'::jsonb,
  updated_at bigint not null
);

alter table public.lesson_comments enable row level security;
alter table public.student_progress enable row level security;

drop policy if exists "app can read lesson comments" on public.lesson_comments;
create policy "app can read lesson comments"
  on public.lesson_comments
  for select
  to anon
  using (true);

drop policy if exists "app can add lesson comments" on public.lesson_comments;
create policy "app can add lesson comments"
  on public.lesson_comments
  for insert
  to anon
  with check (
    length(id) > 0
    and length(lesson_id) > 0
    and length(student_id) > 0
    and length(student_name) > 0
    and length(text) > 0
  );

drop policy if exists "app can update lesson comments" on public.lesson_comments;
create policy "app can update lesson comments"
  on public.lesson_comments
  for update
  to anon
  using (true)
  with check (
    length(id) > 0
    and length(lesson_id) > 0
    and length(student_id) > 0
    and length(student_name) > 0
    and length(text) > 0
  );

drop policy if exists "app can read student progress" on public.student_progress;
create policy "app can read student progress"
  on public.student_progress
  for select
  to anon
  using (true);

drop policy if exists "app can add student progress" on public.student_progress;
create policy "app can add student progress"
  on public.student_progress
  for insert
  to anon
  with check (length(student_id) > 0 and length(current_lesson_id) > 0);

drop policy if exists "app can update student progress" on public.student_progress;
create policy "app can update student progress"
  on public.student_progress
  for update
  to anon
  using (true)
  with check (length(student_id) > 0 and length(current_lesson_id) > 0);

grant usage on schema public to anon;
grant select, insert, update on public.lesson_comments to anon;
grant select, insert, update on public.student_progress to anon;
