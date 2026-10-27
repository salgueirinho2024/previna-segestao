"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";

// Botão genérico de apagar com confirmação. `action` é uma server action já "bindada" ao id.
export default function DeleteButton({
  action,
  message,
  title = "Apagar",
  label,
  className,
}: {
  action: () => Promise<unknown>;
  message: string;
  title?: string;
  label?: string;
  className?: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      disabled={pending}
      onClick={() => {
        if (confirm(message)) startTransition(() => void action());
      }}
      className={
        className ??
        "inline-flex items-center gap-1 text-muted hover:text-danger transition disabled:opacity-50"
      }
    >
      <Trash2 size={15} />
      {label && <span className="text-xs font-medium">{pending ? "Apagando..." : label}</span>}
    </button>
  );
}
