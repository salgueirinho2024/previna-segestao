"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteEmployeeAction } from "@/app/actions/employees";

export default function DeleteEmployeeButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      title="Remover funcionário"
      disabled={pending}
      onClick={() => {
        if (confirm("Remover este funcionário?")) {
          startTransition(() => deleteEmployeeAction(id));
        }
      }}
      className="text-muted hover:text-danger transition disabled:opacity-50"
    >
      <Trash2 size={15} />
    </button>
  );
}
