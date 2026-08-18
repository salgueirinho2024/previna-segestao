export type VisitStatus = "AGENDADA" | "EM_ANDAMENTO" | "CONCLUIDA";
export type TaskStatus = "PENDENTE" | "EM_ANDAMENTO" | "CONCLUIDA";

export type Company = {
  id: string;
  name: string;
  cnpj: string | null;
  address: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  segment: string | null;
  visit_frequency_days: number;
  notes: string | null;
  created_at: string;
};

export type Visit = {
  id: string;
  company_id: string;
  title: string;
  description: string | null;
  status: VisitStatus;
  scheduled_date: string;
  completed_date: string | null;
  what_was_done: string | null;
  responsible_id: string | null;
  created_by: string | null;
  created_at: string;
  company_name?: string;
  responsible_name?: string | null;
};

export type Task = {
  id: string;
  company_id: string | null;
  visit_id: string | null;
  title: string;
  description: string | null;
  assigned_to_id: string | null;
  due_date: string | null;
  status: TaskStatus;
  created_by: string | null;
  created_at: string;
  company_name?: string | null;
  assigned_to_name?: string | null;
};

export type UserRow = {
  id: string;
  name: string;
  email: string;
  role: "TECNICO" | "ASSISTENTE";
};

export type Employee = {
  id: string;
  company_id: string;
  name: string;
  role_title: string | null;
  admission_date: string | null;
  notes: string | null;
  created_at: string;
  company_name?: string;
};

export type DocumentStatus = "OK" | "PENDENTE" | "OBSERVACAO";

export type DocumentChecklistItem = {
  id: string;
  key: string;
  label: string;
  sort_order: number;
};

export type CompanyDocument = {
  id: string;
  company_id: string;
  item_key: string;
  status: DocumentStatus;
  updated_at: string;
};
