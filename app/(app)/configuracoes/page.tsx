import PageHeader from "@/components/PageHeader";
import { getSession, ROLE_LABEL } from "@/lib/auth";
import { listUsers, listDocumentChecklistItems } from "@/lib/data";

export default async function ConfiguracoesPage() {
  const user = await getSession();
  if (!user) return null;

  let users: Awaited<ReturnType<typeof listUsers>> = [];
  let checklistItems: Awaited<ReturnType<typeof listDocumentChecklistItems>> = [];
  let dbError: string | null = null;

  try {
    [users, checklistItems] = await Promise.all([listUsers(), listDocumentChecklistItems()]);
  } catch (e) {
    dbError = e instanceof Error ? e.message : "Erro ao carregar dados.";
  }

  return (
    <div>
      <PageHeader title="Configurações" subtitle="Sua conta e parâmetros do sistema" />

      <div className="p-8 space-y-8 max-w-2xl">
        {dbError && (
          <div className="rounded-xl border border-amber/40 bg-amber/10 text-amber-deep text-sm px-4 py-3">
            Não foi possível conectar ao banco de dados ({dbError}).
          </div>
        )}

        <section>
          <h2 className="font-display text-base text-pine mb-3">Sua conta</h2>
          <div className="rounded-xl border border-border bg-surface p-5 space-y-2">
            <p className="text-sm"><span className="text-muted">Nome:</span> {user.name}</p>
            <p className="text-sm"><span className="text-muted">E-mail:</span> {user.email}</p>
            <p className="text-sm"><span className="text-muted">Perfil:</span> {ROLE_LABEL[user.role]}</p>
          </div>
        </section>

        <section>
          <h2 className="font-display text-base text-pine mb-3">Usuários do sistema</h2>
          <div className="rounded-xl border border-border bg-surface divide-y divide-border overflow-hidden">
            {users.map((u) => (
              <div key={u.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium">{u.name}</p>
                  <p className="text-xs text-muted">{u.email}</p>
                </div>
                <span className="text-xs text-muted">{ROLE_LABEL[u.role]}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted mt-2">
            Novos usuários são cadastrados direto no banco (Neon → SQL Editor) — veja o README.
          </p>
        </section>

        <section>
          <h2 className="font-display text-base text-pine mb-3">Itens do checklist de documentos</h2>
          <div className="rounded-xl border border-border bg-surface divide-y divide-border overflow-hidden">
            {checklistItems.map((item) => (
              <div key={item.id} className="px-5 py-2.5 text-sm">
                {item.label}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted mt-2">
            Para adicionar ou remover itens do checklist, edite a tabela{" "}
            <code className="font-mono-ui">document_checklist_items</code> no Neon.
          </p>
        </section>
      </div>
    </div>
  );
}
