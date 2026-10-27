"use client";

import { useState, useTransition } from "react";
import { Pencil, X } from "lucide-react";
import { updateVisitAction, deleteVisitAction } from "@/app/actions/visits";
import DeleteButton from "@/components/DeleteButton";
import type { Company, UserRow, Visit } from "@/lib/types";

const input =
  "w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-green/40 focus:border-brand-green";

// Botões de editar/apagar de uma visita + modal de edição.
export default function VisitActions({
  visit,
  companies,
  users,
}: {
  visit: Visit;
  companies: Company[];
  users: UserRow[];
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError("");
    startTransition(async () => {
      const res = await updateVisitAction({
        id: visit.id,
        company_id: String(fd.get("company_id") || ""),
        title: String(fd.get("title") || ""),
        description: String(fd.get("description") || ""),
        scheduled_date: String(fd.get("scheduled_date") || ""),
        responsible_id: String(fd.get("responsible_id") || ""),
        what_was_done: String(fd.get("what_was_done") || ""),
      });
      if (res.error) setError(res.error);
      else setOpen(false);
    });
  }

  return (
    <>
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          type="button"
          title="Editar visita"
          aria-label="Editar visita"
          onClick={() => setOpen(true)}
          className="text-muted hover:text-brand-green-dark transition"
        >
          <Pencil size={14} />
        </button>
        <DeleteButton
          action={deleteVisitAction.bind(null, visit.id, visit.company_id)}
          message={`Apagar a visita "${visit.title}"? Esta ação não pode ser desfeita.`}
          title="Apagar visita"
        />
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <form
            onSubmit={onSubmit}
            onClick={(e) => e.stopPropagation()}
            className="bg-surface rounded-xl border border-border w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base text-pine">Editar visita</h3>
              <button type="button" onClick={() => setOpen(false)} aria-label="Fechar" className="text-muted hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Empresa</label>
              <select name="company_id" required defaultValue={visit.company_id} className={input}>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">O que precisa ser feito</label>
              <input name="title" required defaultValue={visit.title} className={input} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Data da visita</label>
                <input
                  name="scheduled_date"
                  type="date"
                  required
                  defaultValue={String(visit.scheduled_date).slice(0, 10)}
                  className={input}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Responsável</label>
                <select name="responsible_id" defaultValue={visit.responsible_id ?? ""} className={input}>
                  <option value="">Não definido</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Detalhes</label>
              <textarea name="description" rows={2} defaultValue={visit.description ?? ""} className={`${input} resize-none`} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">O que foi feito</label>
              <textarea name="what_was_done" rows={2} defaultValue={visit.what_was_done ?? ""} className={`${input} resize-none`} />
            </div>

            {error && (
              <div className="rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm px-3.5 py-2.5">{error}</div>
            )}

            <div className="flex justify-end gap-3 pt-1">
              <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 text-sm text-muted hover:text-foreground transition">
                Cancelar
              </button>
              <button
                type="submit"
                disabled={pending}
                className="bg-brand-green hover:bg-brand-green-dark disabled:opacity-60 text-white text-sm font-medium px-5 py-2 rounded-lg transition"
              >
                {pending ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
