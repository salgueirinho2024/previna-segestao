import type { DocumentStatus } from "./types";

// Quantos dias antes do vencimento o documento passa a ser "A vencer".
export const DOC_WARNING_DAYS = 30;

function parseLocal(dateStr: string): Date {
  const [y, m, d] = dateStr.slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function daysUntilDate(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((parseLocal(dateStr).getTime() - today.getTime()) / 86400000);
}

export function documentStatus(
  elaborationDate: string | null | undefined,
  expiryDate: string | null | undefined
): DocumentStatus {
  if (expiryDate) {
    const days = daysUntilDate(expiryDate);
    if (days < 0) return "VENCIDO";
    if (days <= DOC_WARNING_DAYS) return "A_VENCER";
    return "EM_DIA";
  }
  // Tem data de elaboração mas não tem vencimento: documento existe e não expira.
  if (elaborationDate) return "EM_DIA";
  return "SEM_DATA";
}

// Documentos que precisam de atenção: sem data (não elaborado) ou vencidos.
export function isDocumentPending(status: DocumentStatus): boolean {
  return status === "SEM_DATA" || status === "VENCIDO";
}

export function formatDateBr(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  const [y, m, d] = dateStr.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
}

export const DOC_STATUS_LABEL: Record<DocumentStatus, string> = {
  SEM_DATA: "Sem data",
  EM_DIA: "Em dia",
  A_VENCER: "A vencer",
  VENCIDO: "Vencido",
};
