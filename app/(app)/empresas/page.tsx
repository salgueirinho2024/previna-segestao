import Link from "next/link";
import { Plus, Building2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { listCompanies, listVisits, visitUrgency } from "@/lib/data";

export default async function EmpresasPage() {
  let companies: Awaited<ReturnType<typeof listCompanies>> = [];
  let visits: Awaited<ReturnType<typeof listVisits>> = [];
  let dbError: string | null = null;

  try {
    [companies, visits] = await Promise.all([listCompanies(), listVisits()]);
  } catch (e) {
    dbError = e instanceof Error ? e.message : "Erro ao carregar dados.";
  }

  return (
    <div>
      <PageHeader
        title="Empresas"
        subtitle={`${companies.length} empresa${companies.length === 1 ? "" : "s"} cadastrada${companies.length === 1 ? "" : "s"}`}
        action={
          <Link
            href="/empresas/nova"
            className="flex items-center gap-1.5 bg-brand-green hover:bg-brand-green-dark text-white text-sm font-medium px-3.5 py-2 rounded-lg transition"
          >
            <Plus size={16} /> Nova empresa
          </Link>
        }
      />

      <div className="p-8">
        {dbError && (
          <div className="rounded-xl border border-amber/40 bg-amber/10 text-amber-deep text-sm px-4 py-3 mb-6">
            Banco ainda não configurado ({dbError}).
          </div>
        )}

        {companies.length === 0 && !dbError ? (
          <div className="rounded-xl border border-dashed border-border px-8 py-16 text-center">
            <Building2 className="mx-auto text-muted mb-3" size={28} />
            <p className="text-sm text-muted mb-4">Nenhuma empresa cadastrada ainda.</p>
            <Link
              href="/empresas/nova"
              className="inline-flex items-center gap-1.5 bg-brand-green hover:bg-brand-green-dark text-white text-sm font-medium px-4 py-2 rounded-lg transition"
            >
              <Plus size={16} /> Cadastrar primeira empresa
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {companies.map((c) => {
              const companyVisits = visits.filter((v) => v.company_id === c.id && v.status !== "CONCLUIDA");
              const nextVisit = companyVisits.sort((a, b) => a.scheduled_date.localeCompare(b.scheduled_date))[0];
              const urgency = nextVisit ? visitUrgency(nextVisit) : null;

              const dotClass = {
                atrasada: "bg-danger",
                urgente: "bg-amber",
                "no-prazo": "bg-brand-green",
                concluida: "bg-mint",
              } as const;

              return (
                <Link
                  key={c.id}
                  href={`/empresas/${c.id}`}
                  className="rounded-xl border border-border bg-surface p-5 hover:border-brand-green/50 hover:shadow-sm transition group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-9 h-9 rounded-lg bg-pine/5 text-pine flex items-center justify-center">
                      <Building2 size={16} />
                    </div>
                    {urgency && <span className={`w-2 h-2 rounded-full mt-1.5 ${dotClass[urgency]}`} />}
                  </div>
                  <p className="font-medium text-sm text-foreground group-hover:text-brand-green-dark transition truncate">
                    {c.name}
                  </p>
                  <p className="text-xs text-muted mt-1 truncate">{c.segment || "Sem segmento definido"}</p>
                  <p className="text-xs text-muted mt-3 font-mono-ui">
                    Retorno a cada {c.visit_frequency_days} dias
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
