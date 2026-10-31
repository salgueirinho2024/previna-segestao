import ListSearch from "@/components/ListSearch";
import PageHeader from "@/components/PageHeader";
import NewEmployeeForm from "@/components/NewEmployeeForm";
import EmployeeRow from "@/components/EmployeeRow";
import { listCompanies, listEmployees } from "@/lib/data";

export default async function FuncionariosPage({searchParams}:{searchParams:Promise<{q?:string}>}) {
  const {q=""}=await searchParams;
  const search=q.trim().toLocaleLowerCase("pt-BR");
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
        <ListSearch placeholder="Buscar funcionário, cargo ou empresa..."/>
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
            .filter((c) => (byCompany.get(c.id)?.length ?? 0) > 0 && (!search || (byCompany.get(c.id) ?? []).some(e=>`${e.name} ${e.role_title||""} ${c.name}`.toLocaleLowerCase("pt-BR").includes(search))))
            .map((c) => (
              <section key={c.id}>
                <h2 className="font-display text-base text-pine mb-3">{c.name}</h2>
                <div className="rounded-xl border border-border bg-surface divide-y divide-border overflow-hidden">
                  {(byCompany.get(c.id) ?? []).filter(e=>!search||`${e.name} ${e.role_title||""} ${c.name}`.toLocaleLowerCase("pt-BR").includes(search)).map((e) => (
                    <EmployeeRow key={e.id} employee={e} companies={companies} />
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
