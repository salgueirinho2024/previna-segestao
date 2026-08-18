import PageHeader from "@/components/PageHeader";
import NewEmployeeForm from "@/components/NewEmployeeForm";
import DeleteEmployeeButton from "@/components/DeleteEmployeeButton";
import { listCompanies, listEmployees } from "@/lib/data";
import { formatDatePt } from "@/lib/format";

export default async function FuncionariosPage() {
  let companies: Awaited<ReturnType<typeof listCompanies>> = [];
  let employees: Awaited<ReturnType<typeof listEmployees>> = [];
  let dbError: string | null = null;

  try {
    [companies, employees] = await Promise.all([listCompanies(), listEmployees()]);
  } catch (e) {
    dbError = e instanceof Error ? e.message : "Erro ao carregar dados.";
  }

  const byCompany = new Map<string, typeof employees>();
  for (const e of employees) {
    const list = byCompany.get(e.company_id) ?? [];
    list.push(e);
    byCompany.set(e.company_id, list);
  }

  return (
    <div>
      <PageHeader title="Funcionários" subtitle={`${employees.length} funcionário(s) cadastrado(s)`} />

      <div className="p-8 space-y-6 max-w-4xl">
        {dbError && (
          <div className="rounded-xl border border-amber/40 bg-amber/10 text-amber-deep text-sm px-4 py-3">
            Não foi possível conectar ao banco de dados ({dbError}).
          </div>
        )}

        <NewEmployeeForm companies={companies} />

        {companies.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border px-5 py-10 text-sm text-muted text-center">
            Cadastre uma empresa primeiro para poder adicionar funcionários.
          </div>
        ) : (
          companies
            .filter((c) => (byCompany.get(c.id)?.length ?? 0) > 0)
            .map((c) => (
              <section key={c.id}>
                <h2 className="font-display text-base text-pine mb-3">{c.name}</h2>
                <div className="rounded-xl border border-border bg-surface divide-y divide-border overflow-hidden">
                  {(byCompany.get(c.id) ?? []).map((e) => (
                    <div key={e.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{e.name}</p>
                        <p className="text-xs text-muted truncate">
                          {e.role_title || "Cargo não informado"}
                          {e.admission_date ? ` · admitido em ${formatDatePt(e.admission_date)}` : ""}
                        </p>
                      </div>
                      <DeleteEmployeeButton id={e.id} />
                    </div>
                  ))}
                </div>
              </section>
            ))
        )}

        {companies.length > 0 && employees.length === 0 && (
          <div className="rounded-xl border border-dashed border-border px-5 py-10 text-sm text-muted text-center">
            Nenhum funcionário cadastrado ainda.
          </div>
        )}
      </div>
    </div>
  );
}
