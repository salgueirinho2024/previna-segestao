"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createVisitAction } from "@/app/actions/visits";
import type { FormState } from "@/app/actions/companies";
import type { Company, UserRow } from "@/lib/types";

const initialState: FormState = {};

export default function NovaVisitaForm({
  companies,
  users,
  defaultCompanyId,
}: {
  companies: Company[];
  users: UserRow[];
  defaultCompanyId?: string;
}) {
  const [state, formAction, pending] = useActionState(createVisitAction, initialState);

  return (
    <form action={formAction} className="space-y-5 bg-surface border border-border rounded-xl p-6">
      <div>
        <label className="block text-sm font-medium mb-1.5">Empresa</label>
        <select
          name="company_id"
          required
          defaultValue={defaultCompanyId || ""}
          className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-green/40 focus:border-brand-green"
        >
          <option value="" disabled>
            Selecione a empresa
          </option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {companies.length === 0 && (
          <p className="text-xs text-amber-deep mt-1.5">
            Nenhuma empresa cadastrada. <Link href="/empresas/nova" className="underline">Cadastre uma primeiro</Link>.
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">O que precisa ser feito</label>
        <input
          name="title"
          required
          placeholder='Ex: "Avaliação de ruído" ou "Visita de acompanhamento PGR"'
          className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-green/40 focus:border-brand-green"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">Data da visita</label>
          <input
            name="scheduled_date"
            type="date"
            required
            className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-green/40 focus:border-brand-green"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Responsável</label>
          <select
            name="responsible_id"
            className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-green/40 focus:border-brand-green"
          >
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
        <label className="block text-sm font-medium mb-1.5">Detalhes (opcional)</label>
        <textarea
          name="description"
          rows={3}
          className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-green/40 focus:border-brand-green resize-none"
        />
      </div>

      {state?.error && (
        <div className="rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm px-3.5 py-2.5">
          {state.error}
        </div>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <Link href="/visitas" className="px-4 py-2.5 text-sm text-muted hover:text-foreground transition">
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="bg-brand-green hover:bg-brand-green-dark disabled:opacity-60 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition"
        >
          {pending ? "Salvando..." : "Agendar visita"}
        </button>
      </div>
    </form>
  );
}
