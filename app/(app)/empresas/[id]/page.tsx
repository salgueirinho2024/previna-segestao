import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Plus, MapPin, Phone, User as UserIcon } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import UrgencyBadge from "@/components/UrgencyBadge";
import DocStatusCell from "@/components/DocStatusCell";
import {
  getCompany,
  listVisitsByCompany,
  listTasksByCompany,
  listUsers,
  listDocumentChecklistItems,
  listCompanyDocumentsByCompany,
  visitUrgency,
  taskUrgency,
  daysUntil,
} from "@/lib/data";
import { formatDatePt } from "@/lib/format";
import VisitStatusForm from "@/components/VisitStatusForm";
import QuickTaskForm from "@/components/QuickTaskForm";
import TaskStatusToggle from "@/components/TaskStatusToggle";
import type { DocumentStatus } from "@/lib/types";

export default async function EmpresaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const company = await getCompany(id);
  if (!company) notFound();

  const [visits, tasks, users, checklistItems, companyDocs] = await Promise.all([
    listVisitsByCompany(id),
    listTasksByCompany(id),
    listUsers(),
    listDocumentChecklistItems(),
    listCompanyDocumentsByCompany(id),
  ]);

  const docStatusMap = new Map<string, DocumentStatus>();
  for (const d of companyDocs) docStatusMap.set(d.item_key, d.status);

  const nextVisit = visits
    .filter((v) => v.status !== "CONCLUIDA")
    .sort((a, b) => a.scheduled_date.localeCompare(b.scheduled_date))[0];

  return (
    <div>
      <PageHeader
        title={company.name}
        subtitle={company.segment || undefined}
        action={
          <Link href="/empresas" className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition">
            <ArrowLeft size={16} /> Empresas
          </Link>
        }
      />

      <div className="p-8 grid grid-cols-[1fr_320px] gap-8 max-w-6xl">
        <div className="space-y-8 min-w-0">
          {/* Próxima visita */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-base text-pine">Vencimento da visita</h2>
              <Link
                href={`/visitas/nova?company_id=${company.id}`}
                className="flex items-center gap-1.5 text-xs font-medium text-brand-green-dark hover:text-brand-green transition"
              >
                <Plus size={14} /> Agendar visita
              </Link>
            </div>
            {nextVisit ? (
              <div className="rounded-xl border border-border bg-surface p-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{nextVisit.title}</p>
                  <p className="text-xs text-muted mt-1">
                    {formatDatePt(nextVisit.scheduled_date)}
                    {nextVisit.responsible_name ? ` · Responsável: ${nextVisit.responsible_name}` : ""}
                  </p>
                  <p className="text-xs text-muted mt-1 font-mono-ui">
                    {daysUntil(nextVisit.scheduled_date) < 0
                      ? `${Math.abs(daysUntil(nextVisit.scheduled_date))} dia(s) de atraso`
                      : `Faltam ${daysUntil(nextVisit.scheduled_date)} dia(s)`}
                  </p>
                </div>
                <UrgencyBadge urgency={visitUrgency(nextVisit)} />
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border px-5 py-6 text-sm text-muted text-center">
                Nenhuma visita agendada. Periodicidade padrão: a cada {company.visit_frequency_days} dias.
              </div>
            )}
          </section>

          {/* Histórico */}
          <section>
            <h2 className="font-display text-base text-pine mb-3">Histórico de visitas</h2>
            {visits.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border px-5 py-6 text-sm text-muted text-center">
                Ainda não há visitas registradas para esta empresa.
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-surface divide-y divide-border overflow-hidden">
                {visits.map((v) => (
                  <div key={v.id} className="px-5 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{v.title}</p>
                        <p className="text-xs text-muted mt-1">
                          {formatDatePt(v.scheduled_date)}
                          {v.responsible_name ? ` · ${v.responsible_name}` : ""}
                        </p>
                        {v.description && <p className="text-xs text-muted mt-1.5">{v.description}</p>}
                        {v.what_was_done && (
                          <p className="text-xs text-foreground mt-2 bg-background rounded-md px-2.5 py-1.5">
                            <span className="text-muted">O que foi feito: </span>
                            {v.what_was_done}
                          </p>
                        )}
                      </div>
                      <UrgencyBadge urgency={visitUrgency(v)} />
                    </div>
                    {v.status !== "CONCLUIDA" && <VisitStatusForm visit={v} />}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Tarefas da empresa */}
          <section>
            <h2 className="font-display text-base text-pine mb-3">Tarefas relacionadas</h2>
            <QuickTaskForm companyId={company.id} users={users} />
            {tasks.length > 0 && (
              <ul className="mt-4 space-y-2">
                {tasks.map((t) => (
                  <li key={t.id} className="rounded-lg border border-border bg-surface px-4 py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex items-center gap-3">
                      <TaskStatusToggle task={t} />
                      <div className="min-w-0">
                        <p className={`text-sm font-medium truncate ${t.status === "CONCLUIDA" ? "line-through text-muted" : ""}`}>
                          {t.title}
                        </p>
                        <p className="text-xs text-muted truncate">
                          {t.assigned_to_name ?? "Sem responsável"}
                          {t.due_date ? ` · vence ${formatDatePt(t.due_date)}` : ""}
                        </p>
                      </div>
                    </div>
                    <UrgencyBadge urgency={taskUrgency(t)} />
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Checklist de documentos */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-base text-pine">Checklist de documentos</h2>
              <Link href="/documentos" className="text-xs font-medium text-brand-green-dark hover:text-brand-green transition">
                Ver todas as empresas
              </Link>
            </div>
            <div className="rounded-xl border border-border bg-surface divide-y divide-border overflow-hidden">
              {checklistItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4 px-5 py-2.5">
                  <p className="text-sm text-foreground">{item.label}</p>
                  <DocStatusCell
                    companyId={company.id}
                    itemKey={item.key}
                    status={docStatusMap.get(item.key) ?? "PENDENTE"}
                  />
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar de dados cadastrais */}
        <aside className="space-y-4">
          <div className="rounded-xl border border-border bg-surface p-5 space-y-3">
            <h3 className="text-xs uppercase tracking-wide text-muted font-medium">Dados da empresa</h3>
            {company.cnpj && <InfoRow label="CNPJ" value={company.cnpj} />}
            {company.address && (
              <InfoRow icon={<MapPin size={14} />} label="Endereço" value={company.address} />
            )}
            {company.contact_name && (
              <InfoRow icon={<UserIcon size={14} />} label="Contato" value={company.contact_name} />
            )}
            {company.contact_phone && (
              <InfoRow icon={<Phone size={14} />} label="Telefone" value={company.contact_phone} />
            )}
            <InfoRow label="Retorno" value={`a cada ${company.visit_frequency_days} dias`} />
            {company.notes && (
              <div className="pt-2 border-t border-border">
                <p className="text-xs text-muted leading-relaxed">{company.notes}</p>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function InfoRow({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 text-sm">
      {icon && <span className="text-muted mt-0.5">{icon}</span>}
      <div>
        <p className="text-xs text-muted">{label}</p>
        <p className="text-foreground">{value}</p>
      </div>
    </div>
  );
}
