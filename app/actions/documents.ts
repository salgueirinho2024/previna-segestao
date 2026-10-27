"use server";

import { revalidatePath } from "next/cache";
import { saveCompanyDocumentDates } from "@/lib/data";
import { getSession } from "@/lib/auth";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function cleanDate(v: string | null): string | null {
  if (!v) return null;
  return DATE_RE.test(v) ? v : null;
}

export async function saveDocumentDatesAction(
  companyId: string,
  itemKey: string,
  elaborationDate: string | null,
  expiryDate: string | null
): Promise<{ error?: string }> {
  const user = await getSession();
  if (!user) return { error: "Sessão expirada." };

  const elab = cleanDate(elaborationDate);
  const exp = cleanDate(expiryDate);
  if (elab && exp && exp < elab) {
    return { error: "O vencimento não pode ser anterior à elaboração." };
  }

  await saveCompanyDocumentDates(companyId, itemKey, elab, exp);
  revalidatePath("/documentos");
  revalidatePath(`/empresas/${companyId}`);
  revalidatePath("/dashboard");
  return {};
}
