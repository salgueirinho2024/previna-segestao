import Link from "next/link";
import { AlertTriangle, Clock3, ClipboardList, Building2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import UrgencyBadge from "@/components/UrgencyBadge";
import { getSession } from "@/lib/auth";
import {
  listVisits,
  listTasks,
  listCompanies,
  listDocumentChecklistItems,
  listCompanyDocuments,
  visitUrgency,
  taskUrgency,
  daysUntil,
} from "@/lib/data";
import { formatDatePt } from "@/lib/format";
import type { DocumentStatus } from "@/lib/types";

export default async function DashboardPage() {
  const user = await getSession();
  if (!user) return null;

  let visits: Awaited<ReturnType<typeof listVisits>> = [];
  let tasks: Awaited<ReturnType<typeof listTasks>> = [];
  let companies: Awaited<ReturnType<typeof listCompanies>> = [];
  let checklistItems: Awaited<ReturnType<typeof listDocumentChecklistItems>> = [];
  let companyDocs: Awaited<ReturnType<typeof listCompanyDocuments>> = [];
  let dbError: string | null = null;

  try {
    [visits, tasks, companies, checklistItems, companyDocs] = await Promise.all([
      listVisits(),
      listTasks(),
      listCompanies(),
      listDocumentChecklistItems(),
      listCompanyDocuments(),
    ]);
  } catch (e) {
    dbError = e instanceof Error ? e.message : "Erro ao carregar dados.";
  }

  const pendingVisits = visits.filter((v) => v.status !== "CONCLUIDA");
  const alerts = pendingVisits
    .filter((v) => visitUrgency(v) === "atrasada" || visitUrgency(v) === "urgente")
    .sort((a, b) => a.scheduled_date.localeCompare(b.scheduled_date));

  const upcoming = pendingVisits
    .filter((v) => visitUrgency(v) === "no-prazo")
    .slice(0, 6);

  const myTasks = tasks
    .filter((t) => t.assigned_to_id === user.id && t.status !== "CONCLUIDA")
    .slice(0, 8);

  const highPriorityOpenTasks = tasks.filter((t) => t.status !== "CONCLUIDA" && taskUrgency(t) !== "no-prazo").length;

  const docStatusMap = new Map<string, DocumentStatus>();
  for (const d of companyDocs) docStatusMap.set(`${d.company_id}:${d.item_key}`, d.status);
  const pendingDocsCount = companies.length * checklistItems.length
    ? companies.reduce((acc, c) => {
        const missing = checklistItems.filter(
          (item) => (docStatusMap.get(`${c.id}:${item.key}`) ?? "PENDENTE") === "PENDENTE"
        ).length;
        return acc + missing;
      }, 0)
    : 0;

  const visitsThisMonth = visits.filter((v) => {
    if (v.status !== "CONCLUIDA" || !v.completed_date) return false;
    const d = new Date(v.completed_date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  // Central de monitoramento: uma linha por empresa, com a próxima visita e status de documentos
  const monitoring = companies.map((c) => {
    const companyVisits = pendingVisits
      .filter((v) => v.company_id === c.id)
      .sort((a, b) => a.scheduled_date.localeCompare(b.scheduled_date));
    const nextVisit = companyVisits[0];
    const missingDocs = checklistItems.filter(
      (item) => (docStatusMap.get(`${c.id}:${item.key}`) ?? "PENDENTE") === "PENDENTE"
    ).length;
    return { company: c, nextVisit, missingDocs };
  });

  return (
    <div>
      <PageHeader title={`Olá, ${user.name.split(" ")[0]}`} subtitle="Aqui está o panorama de hoje" />

      <div className="p-8 space-y-8">
        {dbError && (
          <div className="rounded-xl border border-amber/40 bg-amber/10 text-amber-deep text-sm px-4 py-3">
            Não foi possível conectar ao banco de dados ainda ({dbError}). Configure{" "}
            <code className="font-mono-ui">DATABASE_URL</code> no <code className="font-mono-ui">.env.local</code>{" "}
            para ver os dados reais.
          </div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard icon={Building2} label="Empresas ativas" value={companies.length} tone="green" />
          <KpiCard icon={ClipboardList} label="Atividades pendentes (alta prioridade)" value={highPriorityOpenTasks} tone="danger" />
          <KpiCard icon={AlertTriangle} label="Documentos pendentes" value={pendingDocsCount} tone="amber" />
          <KpiCard icon={Clock3} label="Visitas realizadas este mês" value={visitsThisMonth} tone="green" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-8 items-start">
          {/* Central de monitoramento */}
          <section className="min-w-0">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-base text-pine">Central de monitoramento</h2>
              <Link href="/empresas" className="text-xs font-medium text-brand-green-dark hover:text-brand-green transition">
                Ver todas as empresas
              </Link>
            </div>
            {monitoring.length === 0 ? (
              <EmptyState text="Cadastre uma empresa para começar o monitoramento." />
            ) : (
              <div className="rounded-xl border border-border bg-surface overflow-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="font-medium text-xs uppercase tracking-wide text-muted px-4 py-3">Empresa</th>
                      <th className="font-medium text-xs uppercase tracking-wide text-muted px-4 py-3">Próxima visita</th>
                      <th className="font-medium text-xs uppercase tracking-wide text-muted px-4 py-3">Status</th>
                      <th className="font-medium text-xs uppercase tracking-wide text-muted px-4 py-3">Documentos pendentes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {monitoring.map(({ company, nextVisit, missingDocs }) => (
                      <tr key={company.id} className="hover:bg-background transition">
                        <td className="px-4 py-3">
                          <Link href={`/empresas/${company.id}`} className="text-sm font-medium text-foreground hover:text-brand-green-dark">
                            {company.name}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted whitespace-nowrap">
                          {nextVisit ? formatDatePt(nextVisit.scheduled_date) : "Não agendada"}
                        </td>
                        <td className="px-4 py-3">
                          {nextVisit ? (
                            <UrgencyBadge urgency={visitUrgency(nextVisit)} />
                          ) : (
                            <span className="text-xs text-muted">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded-full ${
                              missingDocs === 0
                                ? "bg-brand-green/10 text-brand-green-dark"
                                : "bg-danger/10 text-danger"
                            }`}
                          >
                            {missingDocs === 0 ? "Completo" : `${missingDocs} pendente(s)`}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Minhas tarefas (painel lateral) */}
          <aside className="min-w-0">
            <h2 className="font-display text-base text-pine mb-3">Minhas tarefas</h2>
            {myTasks.length === 0 ? (
              <EmptyState text="Nenhuma tarefa pendente para você." />
            ) : (
              <ul className="space-y-2">
                {myTasks.map((t) => (
                  <li key={t.id} className="rounded-lg border border-border bg-surface px-4 py-3 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{t.title}</p>
                      <p className="text-xs text-muted mt-0.5 truncate">
                        {t.company_name ?? "Geral"}
                        {t.due_date ? ` · vence ${formatDatePt(t.due_date)}` : ""}
                      </p>
                    </div>
                    <UrgencyBadge urgency={taskUrgency(t)} />
                  </li>
                ))}
              </ul>
            )}
          </aside>
        </div>

        {/* Alertas */}
        <section>
          <h2 className="font-display text-base text-pine mb-3">Alertas de visita</h2>
          {alerts.length === 0 ? (
            <EmptyState text="Nenhuma visita atrasada ou vencendo em breve. Tudo em dia." />
          ) : (
            <div className="rounded-xl border border-border bg-surface divide-y divide-border overflow-hidden">
              {alerts.map((v) => (
                <Link
                  key={v.id}
                  href={`/empresas/${v.company_id}`}
                  className="flex items-center justify-between gap-4 px-5 py-3.5 hover:bg-background transition"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{v.company_name}</p>
                    <p className="text-xs text-muted truncate">{v.title}</p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="text-xs font-mono-ui text-muted">
                      {formatDatePt(v.scheduled_date)}
                      {" · "}
                      {daysUntil(v.scheduled_date) < 0
                        ? `${Math.abs(daysUntil(v.scheduled_date))}d de atraso`
                        : `em ${daysUntil(v.scheduled_date)}d`}
                    </span>
                    <UrgencyBadge urgency={visitUrgency(v)} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Próximas visitas */}
        <section>
          <h2 className="font-display text-base text-pine mb-3">Próximas visitas</h2>
          {upcoming.length === 0 ? (
            <EmptyState text="Nenhuma visita agendada." />
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {upcoming.map((v) => (
                <li key={v.id} className="rounded-lg border border-border bg-surface px-4 py-3">
                  <p className="text-sm font-medium">{v.company_name}</p>
                  <p className="text-xs text-muted mt-0.5">
                    {v.title} · {formatDatePt(v.scheduled_date)}
                    {v.responsible_name ? ` · ${v.responsible_name}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  value: number;
  tone: "danger" | "amber" | "green";
}) {
  const toneClass = {
    danger: "text-danger bg-danger/10",
    amber: "text-amber-deep bg-amber/15",
    green: "text-brand-green-dark bg-brand-green/10",
  }[tone];

  return (
    <div className="rounded-xl border border-border bg-surface p-5 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${toneClass}`}>
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="font-display text-2xl leading-none text-pine">{value}</p>
        <p className="text-xs text-muted mt-1 truncate">{label}</p>
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border px-5 py-6 text-sm text-muted text-center">
      {text}
    </div>
  );
}
