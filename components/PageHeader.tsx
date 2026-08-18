export default function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 px-8 h-16 border-b border-border bg-surface sticky top-0 z-10">
      <div className="flex flex-col justify-center h-full">
        <h1 className="font-display text-lg leading-none text-pine">{title}</h1>
        {subtitle && <p className="text-xs text-muted mt-1.5">{subtitle}</p>}
      </div>
      <div className="flex items-center h-full">{action}</div>
    </div>
  );
}
