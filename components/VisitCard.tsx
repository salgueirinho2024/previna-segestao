"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { updateVisitStatusAction } from "@/app/actions/visits";
import UrgencyBadge from "@/components/UrgencyBadge";
import { visitUrgency, daysUntil } from "@/lib/data";
import { formatDatePt } from "@/lib/format";
import type { Visit } from "@/lib/types";

const NEXT_STATUS: Record<string, string> = {
  AGENDADA: "EM_ANDAMENTO",
  EM_ANDAMENTO: "CONCLUIDA",
};

const URGENCY_BORDER: Record<string, string> = {
  atrasada: "border-l-danger",
  urgente: "border-l-amber",
  "no-prazo": "border-l-brand-green",
  concluida: "border-l-mint",
};

export default function VisitCard({ visit }: { visit: Visit }) {
  const [pending, startTransition] = useTransition();
  const [showConclude, setShowConclude] = useState(false);
  const [note, setNote] = useState("");
  const urgency = visitUrgency(visit);
  const days = daysUntil(visit.scheduled_date);

  function advance() {
    const next = NEXT_STATUS[visit.status];
    if (!next) return;
    if (next === "CONCLUIDA") {
      setShowConclude(true);
      return;
    }
    const fd = new FormData();
    fd.set("id", visit.id);
    fd.set("status", next);
    fd.set("company_id", visit.company_id);
    startTransition(() => updateVisitStatusAction(fd));
  }

  function conclude() {
    const fd = new FormData();
    fd.set("id", visit.id);
    fd.set("status", "CONCLUIDA");
    fd.set("company_id", visit.company_id);
    fd.set("what_was_done", note);
    startTransition(() => updateVisitStatusAction(fd));
  }

  return (
    <div className={`rounded-lg border border-border border-l-4 ${URGENCY_BORDER[urgency]} bg-surface p-3.5 shadow-[0_1px_2px_rgba(15,46,29,0.04)]`}>
      <Link href={`/empresas/${visit.company_id}`} className="block">
        <p className="text-sm font-medium text-foreground hover:text-brand-green-dark transition">{visit.company_name}</p>
        <p className="text-xs text-muted mt-0.5">{visit.title}</p>
      </Link>

      <div className="flex items-center justify-between mt-3">
        <span className="text-[11px] font-mono-ui text-muted">
          {formatDatePt(visit.scheduled_date)}
          {visit.status !== "CONCLUIDA" && (days < 0 ? ` · ${Math.abs(days)}d atraso` : ` · ${days}d`)}
        </span>
        <UrgencyBadge urgency={urgency} />
      </div>

      {visit.responsible_name && (
        <p className="text-[11px] text-muted mt-1.5">Responsável: {visit.responsible_name}</p>
      )}

      {visit.status !== "CONCLUIDA" && !showConclude && (
        <button
          onClick={advance}
          disabled={pending}
          className="mt-3 w-full flex items-center justify-center gap-1.5 text-xs font-medium text-brand-green-dark bg-brand-green/10 hover:bg-brand-green/20 rounded-md py-1.5 transition disabled:opacity-60"
        >
          {visit.status === "AGENDADA" ? "Iniciar visita" : "Concluir visita"}
          {visit.status === "AGENDADA" ? <ArrowRight size={13} /> : <Check size={13} />}
        </button>
      )}

      {showConclude && (
        <div className="mt-3 space-y-2">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="O que foi feito?"
            rows={2}
            className="w-full text-xs rounded-md border border-border bg-background px-2.5 py-1.5 outline-none focus:ring-2 focus:ring-brand-green/40 resize-none"
          />
          <button
            onClick={conclude}
            disabled={pending}
            className="w-full text-xs font-medium text-white bg-brand-green hover:bg-brand-green-dark rounded-md py-1.5 transition disabled:opacity-60"
          >
            Confirmar conclusão
          </button>
        </div>
      )}
    </div>
  );
}
