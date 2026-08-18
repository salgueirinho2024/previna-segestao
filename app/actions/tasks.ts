"use server";

import { revalidatePath } from "next/cache";
import { createTask, updateTaskStatus } from "@/lib/data";
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
