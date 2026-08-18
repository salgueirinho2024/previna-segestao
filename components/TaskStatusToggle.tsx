"use client";

import { useTransition } from "react";
import { Check } from "lucide-react";
import { updateTaskStatusAction } from "@/app/actions/tasks";
import type { Task } from "@/lib/types";

export default function TaskStatusToggle({ task }: { task: Task }) {
  const [pending, startTransition] = useTransition();
  const done = task.status === "CONCLUIDA";

  function toggle() {
    const fd = new FormData();
    fd.set("id", task.id);
    fd.set("status", done ? "PENDENTE" : "CONCLUIDA");
    if (task.company_id) fd.set("company_id", task.company_id);
    startTransition(() => updateTaskStatusAction(fd));
  }

  return (
    <button
      onClick={toggle}
      disabled={pending}
      aria-label={done ? "Marcar como pendente" : "Marcar como concluída"}
      className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition ${
        done ? "bg-brand-green border-brand-green text-white" : "border-border hover:border-brand-green"
      }`}
    >
      {done && <Check size={13} strokeWidth={3} />}
    </button>
  );
}
