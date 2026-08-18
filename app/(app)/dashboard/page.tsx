import Link from "next/link";
import { AlertTriangle, Clock3, ClipboardList } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import UrgencyBadge from "@/components/UrgencyBadge";
import { getSession } from "@/lib/auth";
import { listVisits, listTasks, visitUrgency, taskUrgency, daysUntil } from "@/lib/data";
import { formatDatePt } from "@/lib/format";

export default async function DashboardPage() {
  const user = await getSession();
  if (!user) return null;

  let visits: Awaited<ReturnType<typeof listVisits>> = [];
  let tasks: Awaited<ReturnType<typeof listTasks>> = [];
  let dbError: string | null = null;

  try {
    [visits, tasks] = await Promise.all([listVisits(), listTasks()]);
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

  return (
    <div>
      <PageHeader title={`Olá, ${user.name.split(" ")[0]}`} subtitle="Aqui está o panorama de hoje" />

      <div className="p-8 space-y-8 max-w-5xl">
        {dbError && (
          <div className="rounded-xl border border-amber/40 bg-amber/10 text-amber-deep text-sm px-4 py-3">
            Não foi possível conectar ao banco de dados ainda ({dbError}). Configure{" "}
            <code className="font-mono-ui">DATABASE_URL</code> no <code className="font-mono-ui">.env.local</code>{" "}
            para ver os dados reais.
          </div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-4">
          <KpiCard icon={AlertTriangle} label="Visitas atrasadas" value={alerts.filter((v) => visitUrgency(v) === "atrasada").length} tone="danger" />
          <KpiCard icon={Clock3} label="Vencendo em breve" value={alerts.filter((v) => visitUrgency(v) === "urgente").length} tone="amber" />
          <KpiCard icon={ClipboardList} label="Tarefas em aberto" value={tasks.filter((t) => t.status !== "CONCLUIDA").length} tone="green" />
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

        <div className="grid grid-cols-2 gap-8">
          {/* Próximas visitas */}
          <section>
            <h2 className="font-display text-base text-pine mb-3">Próximas visitas</h2>
            {upcoming.length === 0 ? (
              <EmptyState text="Nenhuma visita agendada." />
            ) : (
              <ul className="space-y-2">
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

          {/* Minhas tarefas */}
          <section>
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
          </section>
        </div>
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
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${toneClass}`}>
        <Icon size={18} />
      </div>
      <div>
        <p className="font-display text-2xl leading-none text-pine">{value}</p>
        <p className="text-xs text-muted mt-1">{label}</p>
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
