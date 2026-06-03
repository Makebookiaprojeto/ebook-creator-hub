import { LucideIcon, TrendingUp } from "lucide-react";

interface Props {
  label: string;
  value: string;
  delta?: string;
  icon: LucideIcon;
  tint?: string;
  action?: React.ReactNode;
  large?: boolean;
}

export function StatCard({ 
  label, 
  value, 
  delta, 
  icon: Icon, 
  tint = "from-violet-500 to-purple-500",
  action,
  large
}: Props) {
  return (
    <div className={`group rounded-2xl border bg-card ${large ? 'p-7' : 'p-5'} shadow-soft transition hover:shadow-elevated hover:-translate-y-0.5`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground">{label}</p>
            {action}
          </div>
          <p className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground">{value}</p>
        </div>
        <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${tint} text-white shadow-md ml-4`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {false && delta && (
        <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-success">
          <TrendingUp className="h-3.5 w-3.5" />
          <span>{delta}</span>
        </div>
      )}
    </div>
  );
}
