"use client";

import { useState, useTransition } from "react";
import { updateVisitStatusAction } from "@/app/actions/visits";
import type { Visit } from "@/lib/types";

export default function VisitStatusForm({ visit }: { visit: Visit }) {
  const [pending, startTransition] = useTransition();
  const [showConclude, setShowConclude] = useState(false);
  const [note, setNote] = useState("");

  function setStatus(status: string, whatWasDone?: string) {
    const fd = new FormData();
    fd.set("id", visit.id);
    fd.set("status", status);
    fd.set("company_id", visit.company_id);
    if (whatWasDone) fd.set("what_was_done", whatWasDone);
    startTransition(() => updateVisitStatusAction(fd));
  }

  if (showConclude) {
    return (
      <div className="mt-3 flex items-start gap-2">
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="O que foi feito nesta visita?"
          rows={2}
          className="flex-1 text-xs rounded-lg border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-brand-green/40 resize-none"
        />
        <button
          disabled={pending}
          onClick={() => setStatus("CONCLUIDA", note)}
          className="shrink-0 bg-brand-green hover:bg-brand-green-dark text-white text-xs font-medium px-3 py-2 rounded-lg transition disabled:opacity-60"
        >
          Concluir
        </button>
      </div>
    );
  }

  return (
    <div className="mt-3 flex gap-2">
      {visit.status === "AGENDADA" && (
        <button
          disabled={pending}
          onClick={() => setStatus("EM_ANDAMENTO")}
          className="text-xs font-medium px-3 py-1.5 rounded-lg border border-border hover:bg-background transition disabled:opacity-60"
        >
          Marcar em andamento
        </button>
      )}
      <button
        disabled={pending}
        onClick={() => setShowConclude(true)}
        className="text-xs font-medium px-3 py-1.5 rounded-lg bg-brand-green/10 text-brand-green-dark hover:bg-brand-green/20 transition disabled:opacity-60"
      >
        Concluir visita
      </button>
    </div>
  );
}
