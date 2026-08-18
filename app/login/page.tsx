"use client";

import { useActionState } from "react";
import Image from "next/image";
import { loginAction, type LoginState } from "@/app/actions/auth";

const initialState: LoginState = {};

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <div className="min-h-screen grid lg:grid-cols-[1.1fr_1fr]">
      {/* Lado de identidade */}
      <div className="hidden lg:flex flex-col justify-between bg-pine text-white p-12 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, #E8A23D 0 18px, transparent 18px 36px)",
            backgroundPosition: "0 0",
          }}
        />
        <div className="relative flex items-center gap-3">
          <Image src="/icons/icon-192.png" alt="Previna" width={40} height={40} className="rounded-xl" />
          <span className="font-display font-medium text-lg tracking-tight">Previna</span>
        </div>

        <div className="relative max-w-md">
          <p className="text-xs uppercase tracking-[0.2em] text-mint/80 mb-4">Se Gestão</p>
          <h1 className="font-display text-4xl leading-[1.1] mb-5">
            Nenhuma visita vence sem você saber.
          </h1>
          <p className="text-white/70 leading-relaxed">
            Histórico de visitas, prazos de retorno e tarefas de cada técnico, tudo num só lugar —
            para a sua consultoria de segurança do trabalho.
          </p>
        </div>

        <p className="relative text-xs text-white/40 font-mono-ui">Previna © {new Date().getFullYear()}</p>
      </div>

      {/* Formulário */}
      <div className="flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <Image src="/icons/icon-192.png" alt="Previna" width={40} height={40} className="rounded-xl" />
            <span className="font-display font-medium text-lg">Previna</span>
          </div>

          <h2 className="font-display text-2xl mb-1 text-pine">Entrar</h2>
          <p className="text-sm text-muted mb-8">Acesse com o e-mail e senha da sua conta.</p>

          <form action={formAction} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
                E-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="voce@previna.com"
                className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-green/40 focus:border-brand-green transition"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-green/40 focus:border-brand-green transition"
              />
            </div>

            {state?.error && (
              <div className="rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm px-3.5 py-2.5">
                {state.error}
              </div>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-lg bg-brand-green hover:bg-brand-green-dark disabled:opacity-60 text-white font-medium text-sm py-2.5 transition"
            >
              {pending ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <p className="text-xs text-muted mt-8 font-mono-ui">
            Diego · Thiago · Tawane
          </p>
        </div>
      </div>
    </div>
  );
}
