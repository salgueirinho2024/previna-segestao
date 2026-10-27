"use client";

import { useState, useTransition } from "react";
import { Pencil, Check, X } from "lucide-react";
import { updateEmployeeAction, deleteEmployeeAction } from "@/app/actions/employees";
import DeleteButton from "@/components/DeleteButton";
import { formatDatePt } from "@/lib/format";
import type { Company, Employee } from "@/lib/types";

const input =
  "rounded-lg border border-border bg-white px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-brand-green/40";

export default function EmployeeRow({ employee, companies }: { employee: Employee; companies: Company[] }) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError("");
    startTransition(async () => {
      const res = await updateEmployeeAction({
        id: employee.id,
        company_id: String(fd.get("company_id") || ""),
        name: String(fd.get("name") || ""),
        role_title: String(fd.get("role_title") || ""),
        admission_date: String(fd.get("admission_date") || ""),
      });
      if (res.error) setError(res.error);
      else setEditing(false);
    });
  }

  if (editing) {
    return (
      <form onSubmit={onSubmit} className="px-5 py-3.5 flex flex-wrap gap-2 items-center bg-background/60">
        <select name="company_id" defaultValue={employee.company_id} className={`${input} min-w-[150px]`}>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <input name="name" required defaultValue={employee.name} placeholder="Nome" className={`${input} flex-1 min-w-[180px]`} />
        <input name="role_title" defaultValue={employee.role_title ?? ""} placeholder="Cargo" className={`${input} min-w-[130px]`} />
        <input
          name="admission_date"
          type="date"
          title="Data de admissão"
          defaultValue={employee.admission_date ? String(employee.admission_date).slice(0, 10) : ""}
          className={input}
        />
        <button type="submit" disabled={pending} title="Salvar" aria-label="Salvar" className="text-brand-green-dark hover:text-brand-green disabled:opacity-50">
          <Check size={18} />
        </button>
        <button type="button" onClick={() => setEditing(false)} title="Cancelar" aria-label="Cancelar" className="text-muted hover:text-foreground">
          <X size={18} />
        </button>
        {error && <p className="w-full text-xs text-danger">{error}</p>}
      </form>
    );
  }

  return (
    <div className="flex items-center justify-between gap-4 px-5 py-3.5">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{employee.name}</p>
        <p className="text-xs text-muted truncate">
          {employee.role_title || "Cargo não informado"}
          {employee.admission_date ? ` · admitido em ${formatDatePt(employee.admission_date)}` : ""}
        </p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          title="Editar funcionário"
          aria-label="Editar funcionário"
          onClick={() => setEditing(true)}
          className="text-muted hover:text-brand-green-dark transition"
        >
          <Pencil size={15} />
        </button>
        <DeleteButton
          action={deleteEmployeeAction.bind(null, employee.id)}
          message={`Remover ${employee.name}?`}
          title="Remover funcionário"
        />
      </div>
    </div>
  );
}
