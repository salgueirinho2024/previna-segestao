import type { Urgency } from "@/lib/data";

const STYLES: Record<Urgency, { label: string; className: string }> = {
  atrasada: { label: "Atrasada", className: "bg-danger/10 text-danger border-danger/25" },
  urgente: { label: "Vence em breve", className: "bg-amber/15 text-amber-deep border-amber/30" },
  "no-prazo": { label: "No prazo", className: "bg-brand-green/10 text-brand-green-dark border-brand-green/25" },
  concluida: { label: "Concluída", className: "bg-mint/25 text-pine border-mint/40" },
};

export default function UrgencyBadge({ urgency }: { urgency: Urgency }) {
  const s = STYLES[urgency];
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full border ${s.className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {s.label}
    </span>
  );
}
