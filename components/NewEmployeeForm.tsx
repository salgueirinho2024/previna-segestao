"use client";

import { useActionState, useEffect, useRef } from "react";
import { createEmployeeAction, type FormState } from "@/app/actions/employees";
import type { Company } from "@/lib/types";

const initialState: FormState = {};

export default function NewEmployeeForm({ companies }: { companies: Company[] }) {
  const [state, formAction, pending] = useActionState(createEmployeeAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!pending && !state?.error) {
      formRef.current?.reset();
    }
  }, [pending, state]);

  return (
    <form ref={formRef} action={formAction} className="rounded-xl border border-border bg-surface p-4 flex flex-wrap gap-2 items-start">
      <select
        name="company_id"
        required
        className="rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-green/40 min-w-[160px]"
      >
        <option value="">Empresa</option>
        {companies.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <input
        name="name"
        required
        placeholder="Nome do funcionário"
        className="flex-1 min-w-[200px] rounded-lg border border-border bg-white px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-green/40 focus:border-brand-green"
      />
      <input
        name="role_title"
        placeholder="Cargo"
        className="rounded-lg border border-border bg-white px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-green/40 min-w-[140px]"
      />
      <input
        name="admission_date"
        type="date"
        title="Data de admissão"
        className="rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-green/40"
      />
      <button
        type="submit"
        disabled={pending}
        className="bg-pine hover:bg-pine-deep text-white text-sm font-medium px-4 py-2 rounded-lg transition disabled:opacity-60"
      >
        {pending ? "Adicionando..." : "Adicionar funcionário"}
      </button>
      {state?.error && <p className="w-full text-xs text-danger">{state.error}</p>}
    </form>
  );
}
