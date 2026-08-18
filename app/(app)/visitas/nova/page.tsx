import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { listCompanies, listUsers } from "@/lib/data";
import NovaVisitaForm from "@/components/NovaVisitaForm";

export default async function NovaVisitaPage({
  searchParams,
}: {
  searchParams: Promise<{ company_id?: string }>;
}) {
  const { company_id } = await searchParams;
  const [companies, users] = await Promise.all([listCompanies(), listUsers()]);

  return (
    <div>
      <PageHeader
        title="Agendar visita"
        action={
          <Link href="/visitas" className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition">
            <ArrowLeft size={16} /> Voltar
          </Link>
        }
      />
      <div className="p-8 max-w-2xl">
        <NovaVisitaForm companies={companies} users={users} defaultCompanyId={company_id} />
      </div>
    </div>
  );
}
