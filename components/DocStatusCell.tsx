"use client";

import { useTransition } from "react";
import { Check, X, AlertCircle } from "lucide-react";
import { cycleDocumentStatusAction } from "@/app/actions/documents";
import type { DocumentStatus } from "@/lib/types";

const STYLES: Record<DocumentStatus, { className: string; icon: React.ReactNode; label: string }> = {
  OK: { className: "bg-brand-green/15 text-brand-green-dark hover:bg-brand-green/25", icon: <Check size={15} strokeWidth={2.5} />, label: "OK" },
  PENDENTE: { className: "bg-danger/15 text-danger hover:bg-danger/25", icon: <X size={15} strokeWidth={2.5} />, label: "Pendente" },
  OBSERVACAO: { className: "bg-sky-100 text-sky-600 hover:bg-sky-200", icon: <AlertCircle size={15} strokeWidth={2.5} />, label: "Observação" },
};

export default function DocStatusCell({
  companyId,
  itemKey,
  status,
}: {
  companyId: string;
  itemKey: string;
  status: DocumentStatus;
}) {
  const [pending, startTransition] = useTransition();
  const s = STYLES[status];

  return (
    <button
      type="button"
      title={`${s.label} — clique para mudar`}
      disabled={pending}
      onClick={() => startTransition(() => cycleDocumentStatusAction(companyId, itemKey))}
      className={`w-7 h-7 rounded-md flex items-center justify-center transition disabled:opacity-50 ${s.className}`}
    >
      {s.icon}
    </button>
  );
}
