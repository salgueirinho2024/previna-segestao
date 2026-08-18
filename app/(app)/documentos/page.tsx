import PageHeader from "@/components/PageHeader";
import DocStatusCell from "@/components/DocStatusCell";
import { listCompanies, listDocumentChecklistItems, listCompanyDocuments } from "@/lib/data";
import type { DocumentStatus } from "@/lib/types";

export default async function DocumentosPage() {
  let companies: Awaited<ReturnType<typeof listCompanies>> = [];
  let items: Awaited<ReturnType<typeof listDocumentChecklistItems>> = [];
  let docs: Awaited<ReturnType<typeof listCompanyDocuments>> = [];
  let dbError: string | null = null;

  try {
    [companies, items, docs] = await Promise.all([
      listCompanies(),
      listDocumentChecklistItems(),
      listCompanyDocuments(),
    ]);
  } catch (e) {
    dbError = e instanceof Error ? e.message : "Erro ao carregar dados.";
  }

  const statusMap = new Map<string, DocumentStatus>();
  for (const d of docs) statusMap.set(`${d.company_id}:${d.item_key}`, d.status);

  return (
    <div>
      <PageHeader title="Documentos" subtitle="Checklist de documentação por empresa — clique para alternar o status" />

      <div className="p-8 space-y-4">
        {dbError && (
          <div className="rounded-xl border border-amber/40 bg-amber/10 text-amber-deep text-sm px-4 py-3">
            Não foi possível conectar ao banco de dados ({dbError}).
          </div>
        )}

        <div className="flex items-center gap-5 text-xs text-muted">
          <span className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-brand-green/25 inline-block" /> OK
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-danger/25 inline-block" /> Pendente
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-sky-200 inline-block" /> Observação
          </span>
        </div>

        {companies.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border px-5 py-10 text-sm text-muted text-center">
            Cadastre uma empresa para começar o checklist de documentos.
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-surface overflow-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="sticky left-0 bg-surface text-left font-medium text-xs uppercase tracking-wide text-muted px-4 py-3 min-w-[200px]">
                    Empresa
                  </th>
                  {items.map((item) => (
                    <th
                      key={item.id}
                      className="text-center font-medium text-xs text-muted px-2 py-3 min-w-[64px] align-bottom"
                    >
                      <span className="block [writing-mode:vertical-rl] rotate-180 whitespace-nowrap">
                        {item.label}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {companies.map((c) => (
                  <tr key={c.id}>
                    <td className="sticky left-0 bg-surface text-sm font-medium text-foreground px-4 py-2.5 whitespace-nowrap">
                      {c.name}
                    </td>
                    {items.map((item) => (
                      <td key={item.id} className="text-center px-2 py-2.5">
                        <DocStatusCell
                          companyId={c.id}
                          itemKey={item.key}
                          status={statusMap.get(`${c.id}:${item.key}`) ?? "PENDENTE"}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
