"use client";

import { useActionState, useEffect, useRef } from "react";
import { createTaskAction } from "@/app/actions/tasks";
import type { FormState } from "@/app/actions/companies";
import type { UserRow } from "@/lib/types";

const initialState: FormState = {};

export default function QuickTaskForm({
  companyId,
  users,
}: {
  companyId?: string;
  users: UserRow[];
}) {
  const [state, formAction, pending] = useActionState(createTaskAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!pending && !state?.error) {
      formRef.current?.reset();
    }
  }, [pending, state]);

  return (
    <form ref={formRef} action={formAction} className="rounded-xl border border-border bg-surface p-4 flex flex-wrap gap-2 items-start">
      {companyId && <input type="hidden" name="company_id" value={companyId} />}
      <input
        name="title"
        required
        placeholder='Ex: "Avaliação de ruído na área de produção"'
        className="flex-1 min-w-[220px] rounded-lg border border-border bg-white px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-green/40 focus:border-brand-green"
      />
      <select
        name="assigned_to_id"
        required
        className="rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-green/40"
      >
        <option value="">Responsável</option>
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name}
          </option>
        ))}
      </select>
      <input
        name="due_date"
        type="date"
        className="rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-green/40"
      />
      <button
        type="submit"
        disabled={pending}
        className="bg-pine hover:bg-pine-deep text-white text-sm font-medium px-4 py-2 rounded-lg transition disabled:opacity-60"
      >
        {pending ? "Adicionando..." : "Atribuir tarefa"}
      </button>
      {state?.error && <p className="w-full text-xs text-danger">{state.error}</p>}
    </form>
  );
}
