import PageHeader from "@/components/PageHeader";
import VisitWorkspace from "@/components/VisitWorkspace";
import {listVisits,listCompanies,listUsers} from "@/lib/data";
export default async function VisitasPage(){
 try {const [visits,companies,users]=await Promise.all([listVisits(),listCompanies(),listUsers()]);return <div><PageHeader title="Visitas" subtitle="Agendamento e controle de vencimentos"/><VisitWorkspace visits={visits} companies={companies} users={users}/></div>}
 catch(e){return <div><PageHeader title="Visitas"/><div className="m-8 p-5 border border-amber/40 rounded-lg">Não foi possível carregar as visitas: {e instanceof Error?e.message:"Erro desconhecido"}</div></div>}
}
