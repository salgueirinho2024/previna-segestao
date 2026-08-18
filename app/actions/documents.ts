"use server";

import { revalidatePath } from "next/cache";
import { cycleCompanyDocumentStatus } from "@/lib/data";
import { getSession } from "@/lib/auth";

export async function cycleDocumentStatusAction(companyId: string, itemKey: string) {
  const user = await getSession();
  if (!user) return;
  await cycleCompanyDocumentStatus(companyId, itemKey);
  revalidatePath("/documentos");
  revalidatePath(`/empresas/${companyId}`);
  revalidatePath("/dashboard");
}
