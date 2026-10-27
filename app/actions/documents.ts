"use server";

import { revalidatePath } from "next/cache";
import { saveCompanyDocument } from "@/lib/data";
import { DOC_WORK_STATUSES } from "@/lib/doc-status";
import type { DocumentWorkStatus } from "@/lib/types";
import { getSession } from "@/lib/auth";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function cleanDate(v: string | null): string | null {
  if (!v) return null;
  return DATE_RE.test(v) ? v : null;
}

export async function saveDocumentAction(
  companyId: string,
  itemKey: string,
  status: DocumentWorkStatus,
  elaborationDate: string | null,
  expiryDate: string | null
): Promise<{ error?: string }> {
  const user = await getSession();
  if (!user) return { error: "Sessão expirada." };

  if (!DOC_WORK_STATUSES.includes(status)) return { error: "Status inválido." };

  const elab = cleanDate(elaborationDate);
  const exp = cleanDate(expiryDate);
  if (elab && exp && exp < elab) {
    return { error: "O vencimento não pode ser anterior à elaboração." };
  }

  await saveCompanyDocument(companyId, itemKey, status, elab, exp);
  revalidatePath("/documentos");
  revalidatePath(`/empresas/${companyId}`);
  revalidatePath("/dashboard");
  return {};
}
