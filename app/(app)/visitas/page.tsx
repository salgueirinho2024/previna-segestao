import Link from "next/link";
import { Plus } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import VisitCard from "@/components/VisitCard";
import { listVisits } from "@/lib/data";

const COLUMNS = [
  { key: "AGENDADA", label: "Agendadas" },
  { key: "EM_ANDAMENTO", label: "Em andamento" },
  { key: "CONCLUIDA", label: "Concluídas" },
] as const;

export default async function VisitasPage() {
  let visits: Awaited<ReturnType<typeof listVisits>> = [];
  let dbError: string | null = null;

  try {
    visits = await listVisits();
  } catch (e) {
    dbError = e instanceof Error ? e.message : "Erro ao carregar dados.";
  }

  return (
    <div className="flex flex-col h-screen">
      <PageHeader
        title="Visitas"
        subtitle="Fluxo de visitas técnicas, do agendamento à conclusão"
        action={
          <Link
            href="/visitas/nova"
            className="flex items-center gap-1.5 bg-brand-green hover:bg-brand-green-dark text-white text-sm font-medium px-3.5 py-2 rounded-lg transition"
          >
            <Plus size={16} /> Agendar visita
          </Link>
        }
      />

      <div className="flex-1 overflow-x-auto p-8">
        {dbError ? (
          <div className="rounded-xl border border-amber/40 bg-amber/10 text-amber-deep text-sm px-4 py-3">
            Banco ainda não configurado ({dbError}).
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-5 min-w-[900px] h-full">
            {COLUMNS.map((col) => {
              const items = visits.filter((v) => v.status === col.key);
              return (
                <div key={col.key} className="flex flex-col min-w-0 bg-background rounded-xl border border-border">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <p className="text-sm font-medium text-pine">{col.label}</p>
                    <span className="text-xs font-mono-ui text-muted bg-surface border border-border rounded-full w-6 h-6 flex items-center justify-center">
                      {items.length}
                    </span>
                  </div>
                  <div className="flex-1 overflow-y-auto lane-scroll p-3 space-y-3">
                    {items.length === 0 ? (
                      <p className="text-xs text-muted text-center py-8">Nenhuma visita aqui</p>
                    ) : (
                      items.map((v) => <VisitCard key={v.id} visit={v} />)
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
