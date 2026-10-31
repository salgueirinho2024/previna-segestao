"use client";
import {useRouter,usePathname,useSearchParams} from "next/navigation";
import {useState} from "react";
import {Search} from "lucide-react";
export default function ListSearch({placeholder="Buscar informações..."}:{placeholder?:string}){
 const router=useRouter(),path=usePathname(),params=useSearchParams();const [q,setQ]=useState(params.get("q")||"");
 return <form onSubmit={e=>{e.preventDefault();const p=new URLSearchParams(params.toString());if(q.trim())p.set("q",q.trim());else p.delete("q");router.push(`${path}${p.toString()?`?${p}`:""}`)}} className="flex items-center gap-2 max-w-xl mb-5"><div className="relative flex-1"><Search size={16} className="absolute left-3 top-3 text-muted"/><input value={q} onChange={e=>setQ(e.target.value)} placeholder={placeholder} className="border border-border bg-white rounded-lg px-3 py-2.5 pl-9 w-full text-sm"/></div><button type="submit" className="rounded-lg bg-pine text-white px-4 py-2.5 text-sm">Buscar</button>{params.has("q")&&<button type="button" onClick={()=>{setQ("");router.push(path)}} className="text-sm text-muted underline">Limpar</button>}</form>
}
