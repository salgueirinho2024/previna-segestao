import { sql } from "./db";
import type {
  Company,
  Task,
  UserRow,
  Visit,
  Employee,
  DocumentChecklistItem,
  CompanyDocument,
  DocumentStatus,
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
  await sql`update tasks set status = ${status} where id = ${id}`;
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
  const rows = await sql`select * from company_documents`;
  return rows as CompanyDocument[];
}

export async function listCompanyDocumentsByCompany(companyId: string): Promise<CompanyDocument[]> {
  const rows = await sql`select * from company_documents where company_id = ${companyId}`;
  return rows as CompanyDocument[];
}

const NEXT_STATUS: Record<DocumentStatus, DocumentStatus> = {
  PENDENTE: "OK",
  OK: "OBSERVACAO",
  OBSERVACAO: "PENDENTE",
};

export async function cycleCompanyDocumentStatus(companyId: string, itemKey: string) {
  const rows = await sql`
    select status from company_documents where company_id = ${companyId} and item_key = ${itemKey} limit 1
  `;
  const current = (rows[0]?.status as DocumentStatus) ?? "PENDENTE";
  const next = NEXT_STATUS[current];
  await sql`
    insert into company_documents (company_id, item_key, status, updated_at)
    values (${companyId}, ${itemKey}, ${next}, now())
    on conflict (company_id, item_key) do update set status = ${next}, updated_at = now()
  `;
  return next;
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
