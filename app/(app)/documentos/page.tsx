import ListSearch from "@/components/ListSearch";
import PageHeader from "@/components/PageHeader";
import DocDateCell from "@/components/DocDateCell";
import { listCompanies, listDocumentChecklistItems, listCompanyDocuments } from "@/lib/data";

export default async function DocumentosPage({searchParams}:{searchParams:Promise<{q?:string}>}) {
  const {q=""}=await searchParams;
  const search=q.trim().toLocaleLowerCase("pt-BR");
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

  const docMap = new Map<string, (typeof docs)[number]>();
  for (const d of docs) docMap.set(`${d.company_id}:${d.item_key}`, d);

  return (
    <div>
      <PageHeader title="Documentos" subtitle="Checklist de documentação por empresa — clique para marcar o status e informar elaboração e vencimento" />

      <div className="p-8 space-y-4">
        <ListSearch placeholder="Buscar empresa no checklist de documentos..."/>
        {dbError && (
          <div className="rounded-xl border border-amber/40 bg-amber/10 text-amber-deep text-sm px-4 py-3">
            Não foi possível conectar ao banco de dados ({dbError}).
          </div>
        )}

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted">
          <span className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-brand-green/25 inline-block" /> Feito
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-sky-500/25 inline-block" /> Em andamento
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-violet-500/25 inline-block" /> Observação
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-black/10 inline-block" /> Pendente
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-amber/30 inline-block" /> A vencer (até 30 dias)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-danger/25 inline-block" /> Vencido
          </span>
          <span className="text-muted/80">A data em cada célula é o vencimento; prazo vencido ou a vencer sobrepõe a cor do status.</span>
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
                      className="text-center font-medium text-xs text-muted px-2 py-3 min-w-[88px] align-bottom"
                    >
                      <span className="block [writing-mode:vertical-rl] rotate-180 whitespace-nowrap">
                        {item.label}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {companies.filter(c=>!search||`${c.name} ${c.cnpj||""}`.toLocaleLowerCase("pt-BR").includes(search)).map((c) => (
                  <tr key={c.id}>
                    <td className="sticky left-0 bg-surface text-sm font-medium text-foreground px-4 py-2.5 whitespace-nowrap">
                      {c.name}
                    </td>
                    {items.map((item) => (
                      <td key={item.id} className="text-center px-2 py-2.5">
                        <DocDateCell
                          companyId={c.id}
                          companyName={c.name}
                          itemKey={item.key}
                          label={item.label}
                          workStatus={docMap.get(`${c.id}:${item.key}`)?.status ?? "PENDENTE"}
                          elaborationDate={docMap.get(`${c.id}:${item.key}`)?.elaboration_date ?? null}
                          expiryDate={docMap.get(`${c.id}:${item.key}`)?.expiry_date ?? null}
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
