"use server";

import { revalidatePath } from "next/cache";
import { createTask, updateTaskStatus, updateTaskDetails, deleteTask } from "@/lib/data";
import { getSession } from "@/lib/auth";
import type { FormState } from "./companies";

export async function createTaskAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getSession();
  if (!user) return { error: "Sessão expirada." };

  const title = String(formData.get("title") || "").trim();
  if (!title) return { error: "Informe o que precisa ser feito." };

  try {
    await createTask({
      title,
      description: String(formData.get("description") || ""),
      company_id: String(formData.get("company_id") || "") || undefined,
      assigned_to_id: String(formData.get("assigned_to_id") || "") || undefined,
      due_date: String(formData.get("due_date") || "") || undefined,
      created_by: user.id,
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Erro ao salvar." };
  }

  revalidatePath("/tarefas");
  revalidatePath("/dashboard");
  const companyId = String(formData.get("company_id") || "");
  if (companyId) revalidatePath(`/empresas/${companyId}`);
  return {};
}

export async function updateTaskStatusAction(formData: FormData) {
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");
  const companyId = String(formData.get("company_id") || "");
  if (!id || !status) return;

  await updateTaskStatus(id, status);
  revalidatePath("/tarefas");
  revalidatePath("/dashboard");
  if (companyId) revalidatePath(`/empresas/${companyId}`);
}

export async function saveActivityAction(data: {id?:string; title:string; description:string; company_id:string|null; assigned_to_id:string|null; due_date:string|null; status:string; priority:string; progress:number; activity_type:string}) {
  const user=await getSession(); if(!user) throw new Error('Sessão expirada');
  if(!data.title.trim()) throw new Error('Informe o título');
  if(!['PENDENTE','EM_ANDAMENTO','CONCLUIDA'].includes(data.status)) throw new Error('Status inválido');
  if(!['ALTA','MEDIA','BAIXA'].includes(data.priority)) throw new Error('Prioridade inválida');
  if(!Number.isInteger(data.progress)||data.progress<0||data.progress>100) throw new Error('Progresso inválido');
  if(data.id) await updateTaskDetails(data.id,data);
  else {
    const {sql}=await import('@/lib/db');
    await sql`insert into tasks (title,description,company_id,assigned_to_id,due_date,status,priority,progress,activity_type,created_by,completed_at) values (${data.title},${data.description},${data.company_id},${data.assigned_to_id},${data.due_date},${data.status},${data.priority},${data.status==='CONCLUIDA'?100:data.progress},${data.activity_type},${user.id},${data.status==='CONCLUIDA'?new Date().toISOString():null})`;
  }
  revalidatePath('/tarefas');revalidatePath('/calendario');revalidatePath('/dashboard');
}
export async function deleteActivityAction(id:string) {
  const user=await getSession();if(!user) throw new Error('Sessão expirada');
  await deleteTask(id);revalidatePath('/tarefas');revalidatePath('/calendario');revalidatePath('/dashboard');
}
