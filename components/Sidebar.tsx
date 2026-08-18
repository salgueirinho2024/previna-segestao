"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/actions/auth";
import { ROLE_LABEL, type SessionUser } from "@/lib/auth-shared";
import {
  LayoutDashboard,
  Building2,
  CalendarCheck2,
  ListChecks,
  Users,
  FileCheck2,
  Settings,
  LogOut,
} from "lucide-react";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/empresas", label: "Empresas", icon: Building2 },
  { href: "/tarefas", label: "Atividades", icon: ListChecks },
  { href: "/funcionarios", label: "Funcionários", icon: Users },
  { href: "/documentos", label: "Documentos", icon: FileCheck2 },
  { href: "/visitas", label: "Visitas", icon: CalendarCheck2 },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];

export default function Sidebar({ user }: { user: SessionUser }) {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 bg-pine text-white flex flex-col h-screen sticky top-0">
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-pine-line">
        <Image src="/icons/icon-192.png" alt="Previna-Se" width={32} height={32} className="rounded-lg" />
        <div>
          <p className="font-display text-sm font-medium leading-none">Previna-Se</p>
          <p className="text-[10px] text-mint/70 mt-0.5 tracking-wide uppercase">Gestão</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-1">
        {NAV.map((item) => {
          const active = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                active
                  ? "bg-brand-green text-white font-medium"
                  : "text-white/70 hover:bg-pine-line hover:text-white"
              }`}
            >
              <Icon size={17} strokeWidth={2} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-pine-line">
        <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-brand-green/90 flex items-center justify-center text-xs font-semibold shrink-0">
            {user.name.slice(0, 1)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <p className="text-[11px] text-white/50 truncate">{ROLE_LABEL[user.role]}</p>
          </div>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/60 hover:bg-pine-line hover:text-white transition"
          >
            <LogOut size={16} />
            Sair
          </button>
        </form>
      </div>
    </aside>
  );
}
