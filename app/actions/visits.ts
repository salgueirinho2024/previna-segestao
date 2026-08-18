"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createVisit, updateVisitStatus } from "@/lib/data";
import { getSession } from "@/lib/auth";
import type { FormState } from "./companies";

export async function createVisitAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getSession();
  if (!user) return { error: "Sessão expirada." };

  const company_id = String(formData.get("company_id") || "");
  const title = String(formData.get("title") || "").trim();
  const scheduled_date = String(formData.get("scheduled_date") || "");

  if (!company_id || !title || !scheduled_date) {
    return { error: "Preencha empresa, o que será feito e a data." };
  }

  try {
    await createVisit({
      company_id,
      title,
      description: String(formData.get("description") || ""),
      scheduled_date,
      responsible_id: String(formData.get("responsible_id") || "") || undefined,
      created_by: user.id,
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Erro ao salvar." };
  }

  revalidatePath("/visitas");
  revalidatePath(`/empresas/${company_id}`);
  redirect(`/empresas/${company_id}`);
}

export async function updateVisitStatusAction(formData: FormData) {
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");
  const companyId = String(formData.get("company_id") || "");
  const whatWasDone = String(formData.get("what_was_done") || "");
  if (!id || !status) return;

  await updateVisitStatus(id, status, whatWasDone || undefined);
  revalidatePath("/visitas");
  revalidatePath("/dashboard");
  if (companyId) revalidatePath(`/empresas/${companyId}`);
}
