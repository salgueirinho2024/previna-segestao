"use client";
import {useMemo,useState} from "react";
import Link from "next/link";
import {Plus,Search,CalendarDays} from "lucide-react";
import VisitCard from "@/components/VisitCard";
import type {Visit,Company,UserRow} from "@/lib/types";

const monthLabel=(date:Date)=>date.toLocaleDateString("pt-BR",{month:"long",year:"numeric"});
const localDay=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`};
const monthKey=(d:Date)=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
export default function VisitWorkspace({visits,companies,users}:{visits:Visit[],companies:Company[],users:UserRow[]}){
 const [query,setQuery]=useState("");const [company,setCompany]=useState("");const [range,setRange]=useState("mes");
 const now=new Date();const thisMonth=monthKey(now);const next=new Date(now.getFullYear(),now.getMonth()+1,1);const nextMonth=monthKey(next);const today=localDay();
 const pending=visits.filter(v=>v.status!=="CONCLUIDA");
 const groups=[{key:"vencidas",title:"Vencidas",count:pending.filter(v=>v.scheduled_date<today).length},{key:"mes",title:`Este mês (${monthLabel(now)})`,count:pending.filter(v=>v.scheduled_date>=today&&v.scheduled_date.slice(0,7)===thisMonth).length},{key:"proximo",title:`Próximo mês (${monthLabel(next)})`,count:pending.filter(v=>v.scheduled_date.slice(0,7)===nextMonth).length},{key:"futuras",title:"Outras pendentes",count:pending.filter(v=>v.scheduled_date.slice(0,7)>nextMonth).length},{key:"concluidas",title:"Concluídas",count:visits.filter(v=>v.status==="CONCLUIDA").length},{key:"todas",title:"Todas",count:visits.length}];
 const filtered=useMemo(()=>visits.filter(v=>{
  const search=`${v.company_name||""} ${v.title} ${v.description||""} ${v.responsible_name||""} ${v.scheduled_date}`.toLocaleLowerCase("pt-BR");
  if(query&&!search.includes(query.toLocaleLowerCase("pt-BR")))return false;
  if(company&&v.company_id!==company)return false;
  if(range==="vencidas")return v.status!=="CONCLUIDA"&&v.scheduled_date<today;
  if(range==="mes")return v.status!=="CONCLUIDA"&&v.scheduled_date>=today&&v.scheduled_date.slice(0,7)===thisMonth;
  if(range==="proximo")return v.status!=="CONCLUIDA"&&v.scheduled_date.slice(0,7)===nextMonth;
  if(range==="futuras")return v.status!=="CONCLUIDA"&&v.scheduled_date.slice(0,7)>nextMonth;
  if(range==="concluidas")return v.status==="CONCLUIDA";
  return true;
 }).sort((a,b)=>a.scheduled_date.localeCompare(b.scheduled_date)),[visits,query,company,range,today,thisMonth,nextMonth]);
 return <div className="p-6 space-y-5">
  <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-display text-xl text-pine">Controle de visitas e vencimentos</h2><p className="text-sm text-muted">Visitas pendentes, atrasadas e previstas por mês. Datas são as datas agendadas.</p></div><Link href="/visitas/nova" className="inline-flex gap-2 items-center bg-brand-green text-white px-4 py-2.5 rounded-lg text-sm"><Plus size={17}/> Agendar visita</Link></div>
  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">{groups.map(g=><button key={g.key} type="button" onClick={()=>setRange(g.key)} className={`text-left rounded-xl border p-4 transition ${range===g.key?"border-brand-green bg-brand-green/10":"border-border bg-surface hover:border-brand-green/50"}`}><div className="text-2xl font-semibold text-pine">{g.count}</div><div className="text-xs text-muted mt-1 capitalize">{g.title}</div></button>)}</div>
  <div className="flex flex-wrap gap-3 items-center"><div className="relative flex-1 min-w-56"><Search size={17} className="absolute top-3 left-3 text-muted"/><input aria-label="Pesquisar visitas" placeholder="Buscar empresa, visita, responsável ou data..." className="w-full rounded-lg border border-border px-4 py-2.5 pl-10 text-sm bg-white" value={query} onChange={e=>setQuery(e.target.value)}/></div><select aria-label="Filtrar empresa" className="rounded-lg border border-border px-3 py-2.5 bg-white text-sm max-w-64" value={company} onChange={e=>setCompany(e.target.value)}><option value="">Todas as empresas</option>{companies.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
  <div className="flex gap-2 items-center text-sm text-muted"><CalendarDays size={16}/>{filtered.length} visita(s) encontrada(s)</div>
  {filtered.length===0?<div className="rounded-xl border border-dashed border-border p-10 text-center text-muted text-sm">Nenhuma visita neste filtro. Você pode mudar o período ou agendar uma nova visita.</div>:<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">{filtered.map(v=><VisitCard key={v.id} visit={v} companies={companies} users={users}/>)}</div>}
 </div>;
}
