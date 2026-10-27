"use client";

import { useState, useTransition } from "react";
import { Check, X, Clock, AlertTriangle, Minus, Loader, MessageSquareWarning } from "lucide-react";
import { saveDocumentAction } from "@/app/actions/documents";
import { documentStatus, formatDateBr, DOC_STATUS_LABEL, DOC_WORK_LABEL, DOC_WORK_STATUSES } from "@/lib/doc-status";
import type { DocumentStatus, DocumentWorkStatus } from "@/lib/types";

type Tone = { className: string; icon: React.ReactNode };

// Cor/ícone por andamento (marcado manualmente)
const WORK_STYLES: Record<DocumentWorkStatus, Tone> = {
  FEITO: { className: "bg-brand-green/15 text-brand-green-dark hover:bg-brand-green/25", icon: <Check size={14} strokeWidth={2.5} /> },
  EM_ANDAMENTO: { className: "bg-sky-500/15 text-sky-700 hover:bg-sky-500/25", icon: <Loader size={14} strokeWidth={2.5} /> },
  OBSERVACAO: { className: "bg-violet-500/15 text-violet-700 hover:bg-violet-500/25", icon: <MessageSquareWarning size={14} strokeWidth={2.5} /> },
  PENDENTE: { className: "bg-black/5 text-muted hover:bg-black/10", icon: <Minus size={14} strokeWidth={2.5} /> },
};

// O prazo pesa mais que o andamento: vencido ou a vencer sobrescrevem a cor.
const DATE_OVERRIDE: Partial<Record<DocumentStatus, Tone>> = {
  VENCIDO: { className: "bg-danger/15 text-danger hover:bg-danger/25", icon: <AlertTriangle size={14} strokeWidth={2.5} /> },
  A_VENCER: { className: "bg-amber/20 text-amber-deep hover:bg-amber/30", icon: <Clock size={14} strokeWidth={2.5} /> },
};

function shortDate(d: string | null) {
  if (!d) return "—";
  const f = formatDateBr(d);
  return f.slice(0, 6) + f.slice(8);
}

export default function DocDateCell({
  companyId,
  itemKey,
  label,
  companyName,
  workStatus,
  elaborationDate,
  expiryDate,
  variant = "cell",
}: {
  companyId: string;
  itemKey: string;
  label: string;
  companyName?: string;
  workStatus: DocumentWorkStatus;
  elaborationDate: string | null;
  expiryDate: string | null;
  variant?: "cell" | "row";
}) {
  const [open, setOpen] = useState(false);
  const [work, setWork] = useState<DocumentWorkStatus>(workStatus);
  const [elab, setElab] = useState(elaborationDate ?? "");
  const [exp, setExp] = useState(expiryDate ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const dateStatus = documentStatus(elaborationDate, expiryDate);
  const s = DATE_OVERRIDE[dateStatus] ?? WORK_STYLES[workStatus];
  const dateNote = dateStatus === "VENCIDO" || dateStatus === "A_VENCER" ? ` (${DOC_STATUS_LABEL[dateStatus]})` : "";

  function openModal() {
    setWork(workStatus);
    setElab(elaborationDate ?? "");
    setExp(expiryDate ?? "");
    setError(null);
    setOpen(true);
  }

  function save(clear = false) {
    setError(null);
    startTransition(async () => {
      const res = await saveDocumentAction(
        companyId,
        itemKey,
        clear ? "PENDENTE" : work,
        clear ? null : elab || null,
        clear ? null : exp || null
      );
      if (res.error) setError(res.error);
      else setOpen(false);
    });
  }

  const trigger =
    variant === "cell" ? (
      <button
        type="button"
        onClick={openModal}
        title={`${label}: ${DOC_WORK_LABEL[workStatus]}${dateNote} — clique para editar`}
        className={`w-full min-w-[78px] rounded-md px-1.5 py-1 flex flex-col items-center gap-0.5 transition ${s.className}`}
      >
        {s.icon}
        <span className="text-[10px] leading-none font-mono-ui">
          {shortDate(expiryDate)}
        </span>
      </button>
    ) : (
      <button
        type="button"
        onClick={openModal}
        title="Clique para editar"
        className="flex items-center gap-3 text-left"
      >
        <span className="text-xs text-muted font-mono-ui hidden sm:inline">
          Elab. {formatDateBr(elaborationDate)} · Venc. {formatDateBr(expiryDate)}
        </span>
        <span className="flex items-center gap-1.5">
          <span className={`inline-flex items-center gap-1.5 text-xs font-medium rounded-full px-2.5 py-1 transition ${WORK_STYLES[workStatus].className}`}>
            {WORK_STYLES[workStatus].icon}
            {DOC_WORK_LABEL[workStatus]}
          </span>
          {DATE_OVERRIDE[dateStatus] && (
            <span className={`inline-flex items-center gap-1 text-xs font-medium rounded-full px-2 py-1 transition ${DATE_OVERRIDE[dateStatus]!.className}`}>
              {DATE_OVERRIDE[dateStatus]!.icon}
              {DOC_STATUS_LABEL[dateStatus]}
            </span>
          )}
        </span>
      </button>
    );

  return (
    <>
      {trigger}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => !pending && setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-sm rounded-xl bg-surface border border-border p-5 shadow-xl text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h3 className="font-display text-base text-pine">{label}</h3>
                {companyName && <p className="text-xs text-muted mt-0.5">{companyName}</p>}
              </div>
              <button
                type="button"
                aria-label="Fechar"
                onClick={() => setOpen(false)}
                disabled={pending}
                className="text-muted hover:text-foreground transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-xs font-medium text-muted">Status</span>
                <div className="mt-1 grid grid-cols-2 gap-2">
                  {DOC_WORK_STATUSES.map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setWork(st)}
                      className={`flex items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-xs font-medium transition ${
                        work === st
                          ? `${WORK_STYLES[st].className} border-current`
                          : "border-border text-muted hover:bg-black/5"
                      }`}
                    >
                      {WORK_STYLES[st].icon}
                      {DOC_WORK_LABEL[st]}
                    </button>
                  ))}
                </div>
              </div>
              <label className="block">
                <span className="text-xs font-medium text-muted">Data de elaboração</span>
                <input
                  type="date"
                  value={elab}
                  onChange={(e) => {
                    setElab(e.target.value);
                    if (e.target.value && work === "PENDENTE") setWork("FEITO");
                  }}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-muted">Data de vencimento</span>
                <input
                  type="date"
                  value={exp}
                  min={elab || undefined}
                  onChange={(e) => setExp(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
              </label>
            </div>

            {error && <p className="text-xs text-danger mt-3">{error}</p>}

            <div className="flex items-center justify-between mt-5">
              <button
                type="button"
                onClick={() => save(true)}
                disabled={pending || (workStatus === "PENDENTE" && !elaborationDate && !expiryDate)}
                className="text-xs text-muted hover:text-danger transition disabled:opacity-40"
              >
                Limpar tudo
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={pending}
                  className="text-sm px-3 py-2 rounded-lg text-muted hover:text-foreground transition"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => save()}
                  disabled={pending}
                  className="text-sm font-medium px-4 py-2 rounded-lg bg-brand-green text-white hover:bg-brand-green-dark transition disabled:opacity-50"
                >
                  {pending ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
