import { cn } from "../../lib/utils";

const TONES = {
  blue: "bg-blue-50 text-blue-600",
  amber: "bg-amber-50 text-amber-600",
  emerald: "bg-emerald-50 text-emerald-600",
  red: "bg-red-50 text-red-600",
  violet: "bg-violet-50 text-violet-600",
  slate: "bg-slate-100 text-slate-600",
};

const StatCard = ({ title, value, icon: Icon, tone = "blue", hint, onClick }) => {
  const Comp = onClick ? "button" : "div";

  return (
    <Comp
      onClick={onClick}
      className={cn(
        "card flex w-full items-start justify-between p-5 text-left",
        onClick && "cursor-pointer transition hover:-translate-y-0.5 hover:shadow-md"
      )}
    >
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="mt-2 truncate text-2xl font-bold text-slate-900 sm:text-3xl">{value}</p>
        {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      </div>
      {Icon && (
        <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", TONES[tone])}>
          <Icon className="h-5 w-5" />
        </div>
      )}
    </Comp>
  );
};

export default StatCard;
