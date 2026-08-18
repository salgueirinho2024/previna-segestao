-- PREVINA - Se Gestão
-- Schema do banco de dados (Postgres / Neon)
-- Rode este arquivo uma vez no seu banco Neon (via SQL editor do console Neon,
-- ou com: psql "SUA_CONNECTION_STRING" -f db/schema.sql)

create extension if not exists "pgcrypto";

create table if not exists users (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  email         text not null unique,
  password_hash text not null,
  role          text not null check (role in ('DONO','TECNICO','ASSISTENTE')),
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

-- Usuários iniciais (senha padrão: troque depois de logar)
-- As senhas abaixo já vêm com hash bcrypt para: "previna123"
insert into users (name, email, password_hash, role) values
  ('Diego',  'diego@previna.com',  '$2b$10$k6SA6lpT0TzV1u7l4145bu.9PrfW.ozt0NGe/PMwrhBTvu6mQoaM2', 'DONO'),
  ('Thiago', 'thiago@previna.com', '$2b$10$k6SA6lpT0TzV1u7l4145bu.9PrfW.ozt0NGe/PMwrhBTvu6mQoaM2', 'TECNICO'),
  ('Tawane', 'tawane@previna.com', '$2b$10$k6SA6lpT0TzV1u7l4145bu.9PrfW.ozt0NGe/PMwrhBTvu6mQoaM2', 'ASSISTENTE')
on conflict (email) do nothing;
