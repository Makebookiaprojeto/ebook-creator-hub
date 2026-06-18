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
    <div className={`group rounded-2xl border bg-card ${large ? 'p-5 py-10' : 'p-3 py-5'} shadow-soft transition hover:shadow-elevated hover:-translate-y-0.5`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className={`${large ? 'text-base -mt-1' : 'text-sm'} text-muted-foreground`}>{label}</p>
            {action}
          </div>
          <p className={`mt-1 font-display ${large ? 'text-6xl' : 'text-3xl'} font-bold tracking-tight text-foreground`}>{value}</p>
        </div>
        <div className={`flex ${large ? 'h-10 w-10' : 'h-8 w-8'} flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${tint} text-white shadow-md ml-3`}>
          <Icon className={`${large ? 'h-5 w-5' : 'h-4 w-4'}`} />
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
