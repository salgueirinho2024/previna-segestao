-- MIGRAÇÃO v3: checklist de documentos com data de elaboração e vencimento
-- Rode uma vez no Neon (SQL Editor).
--
-- ATENÇÃO: troca TODOS os itens do checklist pelos 11 novos. Como company_documents
-- referencia os itens com "on delete cascade", o status marcado nos itens antigos é apagado.

alter table company_documents add column if not exists elaboration_date date;
alter table company_documents add column if not exists expiry_date date;
-- O status agora é calculado a partir das datas.
alter table company_documents drop column if exists status;

delete from document_checklist_items;

insert into document_checklist_items (key, label, sort_order) values
  ('aep',                  'AEP',                    10),
  ('avaliacao_psicossocial','Avaliação Psicossocial', 20),
  ('cipa',                 'CIPA',                   30),
  ('esocial',              'eSocial',                40),
  ('ficha_epi',            'Ficha de EPI',           50),
  ('ficha_registro',       'Ficha de Registro',      60),
  ('inventario_quimico',   'Inventário Químico',     70),
  ('ltcat',                'LTCAT',                  80),
  ('ltip',                 'LTIP',                   90),
  ('oss',                  'OSS',                    100),
  ('pgr',                  'PGR',                    110)
on conflict (key) do nothing;
