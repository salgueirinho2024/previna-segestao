"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createCompany } from "@/lib/data";
import { getSession } from "@/lib/auth";

export type FormState = { error?: string };

export async function createCompanyAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getSession();
  if (!user) return { error: "Sessão expirada." };

  const name = String(formData.get("name") || "").trim();
  const freq = Number(formData.get("visit_frequency_days") || 30);

  if (!name) return { error: "Informe o nome da empresa." };

  let id: string;
  try {
    id = await createCompany({
      name,
      cnpj: String(formData.get("cnpj") || ""),
      address: String(formData.get("address") || ""),
      contact_name: String(formData.get("contact_name") || ""),
      contact_phone: String(formData.get("contact_phone") || ""),
      segment: String(formData.get("segment") || ""),
      visit_frequency_days: Number.isFinite(freq) && freq > 0 ? freq : 30,
      notes: String(formData.get("notes") || ""),
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Erro ao salvar." };
  }

  revalidatePath("/empresas");
  redirect(`/empresas/${id}`);
}
