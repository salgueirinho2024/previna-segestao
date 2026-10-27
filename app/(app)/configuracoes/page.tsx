import PageHeader from "@/components/PageHeader";
import { getSession, ROLE_LABEL } from "@/lib/auth";

export default async function ConfiguracoesPage() {
  const user = await getSession();
  if (!user) return null;

  return (
    <div>
      <PageHeader title="Configurações" subtitle="Informações da sua conta" />

      <div className="p-8 max-w-2xl">
        <section>
          <h2 className="font-display text-base text-pine mb-3">Sua conta</h2>
          <div className="rounded-xl border border-border bg-surface p-5 space-y-2">
            <p className="text-sm"><span className="text-muted">Nome:</span> {user.name}</p>
            <p className="text-sm"><span className="text-muted">E-mail:</span> {user.email}</p>
            <p className="text-sm"><span className="text-muted">Perfil:</span> {ROLE_LABEL[user.role]}</p>
          </div>
        </section>
      </div>
    </div>
  );
}
