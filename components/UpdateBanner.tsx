"use client";

import { useState, useSyncExternalStore } from "react";
import { Sparkles, X } from "lucide-react";

// Mude esta chave a cada nova atualização para o aviso voltar a aparecer para todos.
const UPDATE_KEY = "update-banner-2026-10-27";

function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  return () => window.removeEventListener("storage", cb);
}

function readDismissed(): boolean {
  try {
    return localStorage.getItem(UPDATE_KEY) === "1";
  } catch {
    return false;
  }
}

export default function UpdateBanner({ children }: { children: React.ReactNode }) {
  // No servidor assume "dispensado" (não renderiza) para evitar diferença na hidratação.
  const dismissedStored = useSyncExternalStore(subscribe, readDismissed, () => true);
  const [closed, setClosed] = useState(false);

  if (dismissedStored || closed) return null;

  function dismiss() {
    try {
      localStorage.setItem(UPDATE_KEY, "1");
    } catch {}
    setClosed(true);
  }

  return (
    <div className="rounded-xl border border-brand-green/30 bg-brand-green/10 px-4 py-3 flex items-start gap-3">
      <Sparkles size={18} className="text-brand-green-dark mt-0.5 shrink-0" />
      <div className="text-sm text-pine flex-1">{children}</div>
      <button
        type="button"
        aria-label="Fechar aviso"
        onClick={dismiss}
        className="text-brand-green-dark hover:text-pine transition shrink-0"
      >
        <X size={16} />
      </button>
    </div>
  );
}
