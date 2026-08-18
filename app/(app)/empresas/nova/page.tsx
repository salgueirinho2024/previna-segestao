"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { createCompanyAction, type FormState } from "@/app/actions/companies";

const initialState: FormState = {};

export default function NovaEmpresaPage() {
  const [state, formAction, pending] = useActionState(createCompanyAction, initialState);

  return (
    <div>
      <PageHeader
        title="Nova empresa"
        action={
          <Link href="/empresas" className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition">
            <ArrowLeft size={16} /> Voltar
          </Link>
        }
      />

      <div className="p-8 max-w-2xl">
        <form action={formAction} className="space-y-5 bg-surface border border-border rounded-xl p-6">
          <Field label="Nome da empresa" name="name" required placeholder="Ex: Metalúrgica Vale Verde Ltda" />

          <div className="grid grid-cols-2 gap-4">
            <Field label="CNPJ" name="cnpj" placeholder="00.000.000/0000-00" />
            <Field label="Segmento" name="segment" placeholder="Ex: Metalurgia" />
          </div>

          <Field label="Endereço" name="address" placeholder="Rua, número, cidade" />

          <div className="grid grid-cols-2 gap-4">
            <Field label="Contato" name="contact_name" placeholder="Nome do responsável" />
            <Field label="Telefone" name="contact_phone" placeholder="(00) 00000-0000" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Periodicidade de retorno (dias)</label>
            <input
              name="visit_frequency_days"
              type="number"
              min={1}
              defaultValue={30}
              className="w-40 rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-green/40 focus:border-brand-green"
            />
            <p className="text-xs text-muted mt-1.5">De quanto em quanto tempo essa empresa precisa de uma nova visita.</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Observações</label>
            <textarea
              name="notes"
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
            <Link href="/empresas" className="px-4 py-2.5 text-sm text-muted hover:text-foreground transition">
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={pending}
              className="bg-brand-green hover:bg-brand-green-dark disabled:opacity-60 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition"
            >
              {pending ? "Salvando..." : "Salvar empresa"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  required,
  placeholder,
}: {
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label}</label>
      <input
        name={name}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-green/40 focus:border-brand-green"
      />
    </div>
  );
}
