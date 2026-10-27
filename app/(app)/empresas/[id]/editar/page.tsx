import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import EditCompanyForm from "@/components/EditCompanyForm";
import { getCompany } from "@/lib/data";

export default async function EditarEmpresaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const company = await getCompany(id);
  if (!company) notFound();

  return (
    <div>
      <PageHeader
        title="Editar empresa"
        subtitle={company.name}
        action={
          <Link href={`/empresas/${id}`} className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition">
            <ArrowLeft size={16} /> Voltar
          </Link>
        }
      />
      <div className="p-8 max-w-2xl">
        <EditCompanyForm company={company} />
      </div>
    </div>
  );
}
