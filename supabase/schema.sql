create table if not exists public.questions (
  id text primary key,
  exam integer not null,
  level text not null check (level in ('intermediate', 'advanced')),
  part text not null check (part in ('listening', 'reading', 'grammar_writing')),
  question_no integer not null,
  title text not null,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  unique (exam, level, part, question_no)
);

create table if not exists public.vocabulary (
  id text primary key,
  question_id text not null references public.questions(id) on delete cascade,
  korean text not null default '',
  chinese text not null default '',
  status text not null default 'new' check (status in ('new', 'learning', 'mastered')),
  review_count integer not null default 0,
  is_favorite boolean not null default false
);

create table if not exists public.grammar (
  id text primary key,
  question_id text not null references public.questions(id) on delete cascade,
  grammar text not null default '',
  expression text not null default '',
  usage text not null default '',
  status text not null default 'new' check (status in ('new', 'learning', 'mastered')),
  review_count integer not null default 0,
  is_favorite boolean not null default false
);

create table if not exists public.expressions (
  id text primary key,
  question_id text not null references public.questions(id) on delete cascade,
  korean_expression text not null default '',
  chinese text not null default '',
  status text not null default 'new' check (status in ('new', 'learning', 'mastered')),
  review_count integer not null default 0,
  is_favorite boolean not null default false
);

create table if not exists public.vocabulary_memory (
  vocabulary_id text primary key references public.vocabulary(id) on delete cascade,
  introduced_on text not null,
  last_reviewed_on text not null
);

create table if not exists public.grammar_memory (
  grammar_id text primary key references public.grammar(id) on delete cascade,
  introduced_on text not null,
  last_reviewed_on text not null
);

create table if not exists public.expression_memory (
  expression_id text primary key references public.expressions(id) on delete cascade,
  introduced_on text not null,
  last_reviewed_on text not null
);

create index if not exists questions_exam_idx on public.questions (exam);
create index if not exists questions_level_idx on public.questions (level);
create index if not exists questions_part_idx on public.questions (part);
create index if not exists vocabulary_question_id_idx on public.vocabulary (question_id);
create index if not exists vocabulary_status_idx on public.vocabulary (status);
create index if not exists grammar_question_id_idx on public.grammar (question_id);
create index if not exists grammar_status_idx on public.grammar (status);
create index if not exists expressions_question_id_idx on public.expressions (question_id);
create index if not exists expressions_status_idx on public.expressions (status);

alter table public.questions enable row level security;
alter table public.vocabulary enable row level security;
alter table public.grammar enable row level security;
alter table public.expressions enable row level security;
alter table public.vocabulary_memory enable row level security;
alter table public.grammar_memory enable row level security;
alter table public.expression_memory enable row level security;
