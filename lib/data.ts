import { sql } from "./db";
import type {
  Company,
  Task,
  UserRow,
  Visit,
  Employee,
  DocumentChecklistItem,
  CompanyDocument,
  DocumentWorkStatus,
} from "./types";

// ---------- Users ----------
export async function listUsers(): Promise<UserRow[]> {
  const rows = await sql`select id, name, email, role from users order by
    case role when 'TECNICO' then 0 else 1 end, name`;
  return rows as UserRow[];
}

// ---------- Companies ----------
export async function listCompanies(): Promise<Company[]> {
  const rows = await sql`select * from companies order by name asc`;
  return rows as Company[];
}

export async function getCompany(id: string): Promise<Company | null> {
  const rows = await sql`select * from companies where id = ${id} limit 1`;
  return (rows[0] as Company) ?? null;
}

export async function createCompany(data: {
  name: string;
  cnpj?: string;
  address?: string;
  contact_name?: string;
  contact_phone?: string;
  segment?: string;
  visit_frequency_days: number;
  notes?: string;
}) {
  const rows = await sql`
    insert into companies (name, cnpj, address, contact_name, contact_phone, segment, visit_frequency_days, notes)
    values (${data.name}, ${data.cnpj || null}, ${data.address || null}, ${data.contact_name || null},
            ${data.contact_phone || null}, ${data.segment || null}, ${data.visit_frequency_days}, ${data.notes || null})
    returning id
  `;
  return rows[0].id as string;
}

// ---------- Visits ----------
export async function listVisits(): Promise<Visit[]> {
  const rows = await sql`
    select v.*, c.name as company_name, u.name as responsible_name
    from visits v
    join companies c on c.id = v.company_id
    left join users u on u.id = v.responsible_id
    order by v.scheduled_date asc
  `;
  return rows as Visit[];
}

export async function listVisitsByCompany(companyId: string): Promise<Visit[]> {
  const rows = await sql`
    select v.*, c.name as company_name, u.name as responsible_name
    from visits v
    join companies c on c.id = v.company_id
    left join users u on u.id = v.responsible_id
    where v.company_id = ${companyId}
    order by v.scheduled_date desc
  `;
  return rows as Visit[];
}

export async function createVisit(data: {
  company_id: string;
  title: string;
  description?: string;
  scheduled_date: string;
  responsible_id?: string;
  created_by?: string;
}) {
  const rows = await sql`
    insert into visits (company_id, title, description, scheduled_date, responsible_id, created_by)
    values (${data.company_id}, ${data.title}, ${data.description || null}, ${data.scheduled_date},
            ${data.responsible_id || null}, ${data.created_by || null})
    returning id
  `;
  return rows[0].id as string;
}

export async function updateVisitStatus(id: string, status: string, whatWasDone?: string) {
  if (status === "CONCLUIDA") {
    await sql`
      update visits set status = ${status}, completed_date = current_date,
        what_was_done = coalesce(${whatWasDone || null}, what_was_done)
      where id = ${id}
    `;
  } else {
    await sql`update visits set status = ${status} where id = ${id}`;
  }
}

// ---------- Tasks ----------
export async function listTasks(): Promise<Task[]> {
  const rows = await sql`
    select t.*, c.name as company_name, u.name as assigned_to_name
    from tasks t
    left join companies c on c.id = t.company_id
    left join users u on u.id = t.assigned_to_id
    order by (t.due_date is null), t.due_date asc, t.created_at desc
  `;
  return rows as Task[];
}

export async function listTasksByCompany(companyId: string): Promise<Task[]> {
  const rows = await sql`
    select t.*, c.name as company_name, u.name as assigned_to_name
    from tasks t
    left join companies c on c.id = t.company_id
    left join users u on u.id = t.assigned_to_id
    where t.company_id = ${companyId}
    order by (t.due_date is null), t.due_date asc, t.created_at desc
  `;
  return rows as Task[];
}

export async function createTask(data: {
  company_id?: string;
  visit_id?: string;
  title: string;
  description?: string;
  assigned_to_id?: string;
  due_date?: string;
  created_by?: string;
}) {
  const rows = await sql`
    insert into tasks (company_id, visit_id, title, description, assigned_to_id, due_date, created_by)
    values (${data.company_id || null}, ${data.visit_id || null}, ${data.title}, ${data.description || null},
            ${data.assigned_to_id || null}, ${data.due_date || null}, ${data.created_by || null})
    returning id
  `;
  return rows[0].id as string;
}

export async function updateTaskStatus(id: string, status: string) {
  await sql`update tasks set status = ${status}, progress = case when ${status} = 'CONCLUIDA' then 100 else progress end, completed_at = case when ${status} = 'CONCLUIDA' then now() else null end where id = ${id}`;
}

// ---------- Employees (Funcionários) ----------
export async function listEmployees(): Promise<Employee[]> {
  const rows = await sql`
    select e.*, c.name as company_name
    from employees e
    join companies c on c.id = e.company_id
    order by c.name asc, e.name asc
  `;
  return rows as Employee[];
}

export async function listEmployeesByCompany(companyId: string): Promise<Employee[]> {
  const rows = await sql`
    select * from employees where company_id = ${companyId} order by name asc
  `;
  return rows as Employee[];
}

export async function createEmployee(data: {
  company_id: string;
  name: string;
  role_title?: string;
  admission_date?: string;
  notes?: string;
}) {
  const rows = await sql`
    insert into employees (company_id, name, role_title, admission_date, notes)
    values (${data.company_id}, ${data.name}, ${data.role_title || null},
            ${data.admission_date || null}, ${data.notes || null})
    returning id
  `;
  return rows[0].id as string;
}

export async function deleteEmployee(id: string) {
  await sql`delete from employees where id = ${id}`;
}

// ---------- Documentos (checklist por empresa) ----------
export async function listDocumentChecklistItems(): Promise<DocumentChecklistItem[]> {
  const rows = await sql`select * from document_checklist_items order by sort_order asc`;
  return rows as DocumentChecklistItem[];
}

export async function listCompanyDocuments(): Promise<CompanyDocument[]> {
  const rows = await sql`select
    id, company_id, item_key, status,
    to_char(elaboration_date, 'YYYY-MM-DD') as elaboration_date,
    to_char(expiry_date, 'YYYY-MM-DD') as expiry_date,
    updated_at
    from company_documents`;
  return rows as CompanyDocument[];
}

export async function listCompanyDocumentsByCompany(companyId: string): Promise<CompanyDocument[]> {
  const rows = await sql`select
    id, company_id, item_key, status,
    to_char(elaboration_date, 'YYYY-MM-DD') as elaboration_date,
    to_char(expiry_date, 'YYYY-MM-DD') as expiry_date,
    updated_at
    from company_documents where company_id = ${companyId}`;
  return rows as CompanyDocument[];
}

// Grava o status e as datas de elaboração e vencimento de um documento de uma empresa.
export async function saveCompanyDocument(
  companyId: string,
  itemKey: string,
  status: DocumentWorkStatus,
  elaborationDate: string | null,
  expiryDate: string | null
) {
  await sql`
    insert into company_documents (company_id, item_key, status, elaboration_date, expiry_date, updated_at)
    values (${companyId}, ${itemKey}, ${status}, ${elaborationDate}, ${expiryDate}, now())
    on conflict (company_id, item_key) do update
      set status = ${status}, elaboration_date = ${elaborationDate}, expiry_date = ${expiryDate}, updated_at = now()
  `;
}

// ---------- Urgency helpers ----------
export function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - today.getTime()) / 86400000);
}

export type Urgency = "atrasada" | "urgente" | "no-prazo" | "concluida";

export function visitUrgency(v: Visit): Urgency {
  if (v.status === "CONCLUIDA") return "concluida";
  const days = daysUntil(v.scheduled_date);
  if (days < 0) return "atrasada";
  if (days <= 5) return "urgente";
  return "no-prazo";
}

export function taskUrgency(t: Task): Urgency {
  if (t.status === "CONCLUIDA") return "concluida";
  if (!t.due_date) return "no-prazo";
  const days = daysUntil(t.due_date);
  if (days < 0) return "atrasada";
  if (days <= 3) return "urgente";
  return "no-prazo";
}

export async function updateTaskDetails(id: string, data: {title:string; description:string; company_id:string|null; assigned_to_id:string|null; due_date:string|null; status:string; priority:string; progress:number; activity_type:string}) {
  await sql`update tasks set title=${data.title}, description=${data.description}, company_id=${data.company_id}, assigned_to_id=${data.assigned_to_id}, due_date=${data.due_date}, status=${data.status}, priority=${data.priority}, progress=${data.status === 'CONCLUIDA' ? 100 : data.progress}, activity_type=${data.activity_type}, completed_at=case when ${data.status}='CONCLUIDA' then coalesce(completed_at,now()) else null end where id=${id}`;
}
export async function deleteTask(id:string) { await sql`delete from tasks where id=${id}`; }

// ---------- Editar / apagar ----------
export async function updateCompany(id: string, data: {
  name: string;
  cnpj?: string;
  address?: string;
  contact_name?: string;
  contact_phone?: string;
  segment?: string;
  visit_frequency_days: number;
  notes?: string;
}) {
  await sql`
    update companies set name = ${data.name}, cnpj = ${data.cnpj || null}, address = ${data.address || null},
      contact_name = ${data.contact_name || null}, contact_phone = ${data.contact_phone || null},
      segment = ${data.segment || null}, visit_frequency_days = ${data.visit_frequency_days},
      notes = ${data.notes || null}
    where id = ${id}
  `;
}

// Apaga a empresa e, por cascade, suas visitas, tarefas, funcionários e checklist.
export async function deleteCompany(id: string) {
  await sql`delete from companies where id = ${id}`;
}

export async function updateVisit(id: string, data: {
  company_id: string;
  title: string;
  description?: string;
  scheduled_date: string;
  responsible_id?: string;
  what_was_done?: string;
}) {
  await sql`
    update visits set company_id = ${data.company_id}, title = ${data.title},
      description = ${data.description || null}, scheduled_date = ${data.scheduled_date},
      responsible_id = ${data.responsible_id || null}, what_was_done = ${data.what_was_done || null}
    where id = ${id}
  `;
}

export async function deleteVisit(id: string) {
  await sql`delete from visits where id = ${id}`;
}

export async function updateEmployee(id: string, data: {
  company_id: string;
  name: string;
  role_title?: string;
  admission_date?: string;
  notes?: string;
}) {
  await sql`
    update employees set company_id = ${data.company_id}, name = ${data.name},
      role_title = ${data.role_title || null}, admission_date = ${data.admission_date || null},
      notes = ${data.notes || null}
    where id = ${id}
  `;
}
