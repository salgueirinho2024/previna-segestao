"use client";

import { useActionState } from "react";
import Link from "next/link";
import { updateCompanyAction, type FormState } from "@/app/actions/companies";
import type { Company } from "@/lib/types";

const initialState: FormState = {};
const input =
  "w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-green/40 focus:border-brand-green";

export default function EditCompanyForm({ company }: { company: Company }) {
  const [state, formAction, pending] = useActionState(updateCompanyAction.bind(null, company.id), initialState);

  return (
    <form action={formAction} className="space-y-5 bg-surface border border-border rounded-xl p-6">
      <Field label="Nome da empresa" name="name" required defaultValue={company.name} />
      <div className="grid grid-cols-2 gap-4">
        <Field label="CNPJ" name="cnpj" defaultValue={company.cnpj} />
        <Field label="Segmento" name="segment" defaultValue={company.segment} />
      </div>
      <Field label="Endereço" name="address" defaultValue={company.address} />
      <div className="grid grid-cols-2 gap-4">
        <Field label="Contato" name="contact_name" defaultValue={company.contact_name} />
        <Field label="Telefone" name="contact_phone" defaultValue={company.contact_phone} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5">Periodicidade de retorno (dias)</label>
        <input
          name="visit_frequency_days"
          type="number"
          min={1}
          defaultValue={company.visit_frequency_days}
          className={`${input} w-40`}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5">Observações</label>
        <textarea name="notes" rows={3} defaultValue={company.notes ?? ""} className={`${input} resize-none`} />
      </div>

      {state?.error && (
        <div className="rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm px-3.5 py-2.5">
          {state.error}
        </div>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <Link href={`/empresas/${company.id}`} className="px-4 py-2.5 text-sm text-muted hover:text-foreground transition">
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="bg-brand-green hover:bg-brand-green-dark disabled:opacity-60 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition"
        >
          {pending ? "Salvando..." : "Salvar alterações"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  required,
  defaultValue,
}: {
  label: string;
  name: string;
  required?: boolean;
  defaultValue?: string | null;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label}</label>
      <input name={name} required={required} defaultValue={defaultValue ?? ""} className={input} />
    </div>
  );
}
