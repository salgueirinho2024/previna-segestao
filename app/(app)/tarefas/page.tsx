import PageHeader from "@/components/PageHeader";
import UrgencyBadge from "@/components/UrgencyBadge";
import QuickTaskForm from "@/components/QuickTaskForm";
import TaskStatusToggle from "@/components/TaskStatusToggle";
import { listTasks, listUsers, taskUrgency } from "@/lib/data";
import { formatDatePt } from "@/lib/format";

export default async function TarefasPage() {
  let tasks: Awaited<ReturnType<typeof listTasks>> = [];
  let users: Awaited<ReturnType<typeof listUsers>> = [];
  let dbError: string | null = null;

  try {
    [tasks, users] = await Promise.all([listTasks(), listUsers()]);
  } catch (e) {
    dbError = e instanceof Error ? e.message : "Erro ao carregar dados.";
  }

  const grouped = users.map((u) => ({
    user: u,
    tasks: tasks.filter((t) => t.assigned_to_id === u.id && t.status !== "CONCLUIDA"),
  }));
  const unassigned = tasks.filter((t) => !t.assigned_to_id && t.status !== "CONCLUIDA");
  const done = tasks.filter((t) => t.status === "CONCLUIDA");

  return (
    <div>
      <PageHeader title="Tarefas" subtitle="O que cada pessoa da equipe precisa fazer" />

      <div className="p-8 space-y-8 max-w-4xl">
        {dbError && (
          <div className="rounded-xl border border-amber/40 bg-amber/10 text-amber-deep text-sm px-4 py-3">
            Banco ainda não configurado ({dbError}).
          </div>
        )}

        <QuickTaskForm users={users} />

        {grouped.map(({ user, tasks: userTasks }) => (
          <section key={user.id}>
            <h2 className="font-display text-base text-pine mb-3">{user.name}</h2>
            {userTasks.length === 0 ? (
              <p className="text-sm text-muted rounded-xl border border-dashed border-border px-5 py-4">
                Nenhuma tarefa pendente.
              </p>
            ) : (
              <ul className="space-y-2">
                {userTasks.map((t) => (
                  <TaskRow key={t.id} task={t} />
                ))}
              </ul>
            )}
          </section>
        ))}

        {unassigned.length > 0 && (
          <section>
            <h2 className="font-display text-base text-pine mb-3">Sem responsável</h2>
            <ul className="space-y-2">
              {unassigned.map((t) => (
                <TaskRow key={t.id} task={t} />
              ))}
            </ul>
          </section>
        )}

        {done.length > 0 && (
          <section>
            <h2 className="font-display text-base text-pine mb-3">Concluídas</h2>
            <ul className="space-y-2">
              {done.slice(0, 15).map((t) => (
                <TaskRow key={t.id} task={t} />
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}

function TaskRow({ task }: { task: Awaited<ReturnType<typeof listTasks>>[number] }) {
  return (
    <li className="rounded-lg border border-border bg-surface px-4 py-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <TaskStatusToggle task={task} />
        <div className="min-w-0">
          <p className={`text-sm font-medium truncate ${task.status === "CONCLUIDA" ? "line-through text-muted" : ""}`}>
            {task.title}
          </p>
          <p className="text-xs text-muted truncate">
            {task.company_name ?? "Geral"}
            {task.due_date ? ` · vence ${formatDatePt(task.due_date)}` : ""}
          </p>
        </div>
      </div>
      <UrgencyBadge urgency={taskUrgency(task)} />
    </li>
  );
}
