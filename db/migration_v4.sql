-- MIGRAÇÃO v4: status manual do documento (Pendente / Em andamento / Feito / Observação)
-- junto com as datas de elaboração e vencimento. Rode uma vez no Neon (SQL Editor).
-- Não apaga nenhum dado existente.

alter table company_documents add column if not exists status text not null default 'PENDENTE';

alter table company_documents drop constraint if exists company_documents_status_valid;
alter table company_documents add constraint company_documents_status_valid
  check (status in ('PENDENTE','EM_ANDAMENTO','FEITO','OBSERVACAO'));

-- Documentos que já têm alguma data preenchida passam a constar como "Feito".
update company_documents
   set status = 'FEITO'
 where status = 'PENDENTE'
   and (elaboration_date is not null or expiry_date is not null);
