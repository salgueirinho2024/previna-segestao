"use server";

import { revalidatePath } from "next/cache";
import { createEmployee, deleteEmployee } from "@/lib/data";
import { getSession } from "@/lib/auth";

export type FormState = { error?: string };

export async function createEmployeeAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getSession();
  if (!user) return { error: "Sessão expirada." };

  const companyId = String(formData.get("company_id") || "");
  const name = String(formData.get("name") || "").trim();
  if (!companyId) return { error: "Selecione a empresa." };
  if (!name) return { error: "Informe o nome do funcionário." };

  try {
    await createEmployee({
      company_id: companyId,
      name,
      role_title: String(formData.get("role_title") || "") || undefined,
      admission_date: String(formData.get("admission_date") || "") || undefined,
      notes: String(formData.get("notes") || "") || undefined,
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Erro ao salvar." };
  }

  revalidatePath("/funcionarios");
  return {};
}

export async function deleteEmployeeAction(id: string) {
  const user = await getSession();
  if (!user) return;
  await deleteEmployee(id);
  revalidatePath("/funcionarios");
}
