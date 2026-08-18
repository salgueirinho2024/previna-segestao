-- MIGRAÇÃO v2: adiciona Funcionários e Checklist de Documentos
-- Rode este arquivo se você já tinha rodado o schema.sql antigo (sem essas tabelas).
-- Quem estiver rodando o schema.sql do zero não precisa rodar este arquivo.

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

