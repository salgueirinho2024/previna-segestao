-- PREVINA-SE GESTÃO
-- Schema do banco de dados (Postgres / Neon)
-- Rode este arquivo uma vez no seu banco Neon (via SQL editor do console Neon,
-- ou com: psql "SUA_CONNECTION_STRING" -f db/schema.sql)

create extension if not exists "pgcrypto";

create table if not exists users (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  email         text not null unique,
  password_hash text not null,
  role          text not null check (role in ('TECNICO','ASSISTENTE')),
  created_at    timestamptz not null default now()
);

create table if not exists companies (
  id                    uuid primary key default gen_random_uuid(),
  name                  text not null,
  cnpj                  text,
  address               text,
  contact_name          text,
  contact_phone         text,
  segment               text,
  visit_frequency_days  integer not null default 30,
  notes                 text,
  created_at            timestamptz not null default now()
);

create table if not exists visits (
  id             uuid primary key default gen_random_uuid(),
  company_id     uuid not null references companies(id) on delete cascade,
  title          text not null,
  description    text,
  status         text not null default 'AGENDADA' check (status in ('AGENDADA','EM_ANDAMENTO','CONCLUIDA')),
  scheduled_date date not null,
  completed_date date,
  what_was_done  text,
  responsible_id uuid references users(id),
  created_by     uuid references users(id),
  created_at     timestamptz not null default now()
);

create table if not exists tasks (
  id             uuid primary key default gen_random_uuid(),
  company_id     uuid references companies(id) on delete cascade,
  visit_id       uuid references visits(id) on delete set null,
  title          text not null,
  description    text,
  assigned_to_id uuid references users(id),
  due_date       date,
  status         text not null default 'PENDENTE' check (status in ('PENDENTE','EM_ANDAMENTO','CONCLUIDA')),
  created_by     uuid references users(id),
  created_at     timestamptz not null default now()
);

create index if not exists idx_visits_company on visits(company_id);
create index if not exists idx_visits_status on visits(status);
create index if not exists idx_tasks_assigned on tasks(assigned_to_id);
create index if not exists idx_tasks_company on tasks(company_id);

create table if not exists employees (
  id             uuid primary key default gen_random_uuid(),
  company_id     uuid not null references companies(id) on delete cascade,
  name           text not null,
  role_title     text,
  admission_date date,
  notes          text,
  created_at     timestamptz not null default now()
);

create table if not exists document_checklist_items (
  id         uuid primary key default gen_random_uuid(),
  key        text not null unique,
  label      text not null,
  sort_order integer not null default 0
);

create table if not exists company_documents (
  id           uuid primary key default gen_random_uuid(),
  company_id   uuid not null references companies(id) on delete cascade,
  item_key     text not null references document_checklist_items(key) on delete cascade,
  status       text not null default 'PENDENTE' check (status in ('OK','PENDENTE','OBSERVACAO')),
  updated_at   timestamptz not null default now(),
  unique (company_id, item_key)
);

create index if not exists idx_employees_company on employees(company_id);
create index if not exists idx_company_documents_company on company_documents(company_id);

-- Itens padrão do checklist de documentos (colunas do "Checklist de Documentos de Empresa")
insert into document_checklist_items (key, label, sort_order) values
  ('ficha_registro',   'Ficha de registro',            10),
  ('logotipo',         'Logotipo',                      20),
  ('dados_empresa',    'Dados da empresa',              30),
  ('cnpj_caepf',       'CNPJ ou CAEPF',                 40),
  ('fluxograma',       'Fluxograma de processos',       50),
  ('locais_trabalho',  'Descrição dos Locais de Trabalho', 60),
  ('revisao_pgr',      'Controle de Revisão do PGR',    70),
  ('matriz_risco',     'Matriz de Risco',               80),
  ('quadro_epi',       'Quadro de EPI',                 90),
  ('matriz_treinamento','Matriz de Treinamento',        100),
  ('oss',              'OSS',                            110),
  ('plano_acao',       'Plano de Ação',                 120),
  ('art',              'ART',                            130)
on conflict (key) do nothing;

-- Cadastre os usuários do seu time depois de rodar este schema.
-- Gere o hash da senha com: node -e "console.log(require('bcryptjs').hashSync('SUA_SENHA', 10))"
-- e insira manualmente, por exemplo:
-- insert into users (name, email, password_hash, role) values
--   ('Nome Sobrenome', 'email@dominio.com', 'HASH_GERADO_ACIMA', 'TECNICO');
