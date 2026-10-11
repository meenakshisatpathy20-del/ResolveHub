import { cn } from "../../lib/utils";

const STATUS_STYLES = {
  Open: "bg-blue-50 text-blue-700 ring-blue-600/20",
  "In Progress": "bg-amber-50 text-amber-700 ring-amber-600/20",
  "Awaiting Customer": "bg-orange-50 text-orange-700 ring-orange-600/20",
  "Awaiting Merchant": "bg-violet-50 text-violet-700 ring-violet-600/20",
  "Awaiting Bank": "bg-violet-50 text-violet-700 ring-violet-600/20",
  "Awaiting Gateway": "bg-violet-50 text-violet-700 ring-violet-600/20",
  Resolved: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  Rejected: "bg-red-50 text-red-700 ring-red-600/20",
};

const PRIORITY_STYLES = {
  Low: "bg-slate-100 text-slate-600 ring-slate-500/20",
  Medium: "bg-sky-50 text-sky-700 ring-sky-600/20",
  High: "bg-orange-50 text-orange-700 ring-orange-600/20",
  Critical: "bg-red-100 text-red-700 ring-red-600/30",
};

const base =
  "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset";

export const StatusBadge = ({ status, className }) => (
  <span className={cn(base, STATUS_STYLES[status] || STATUS_STYLES.Open, className)}>
    <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
    {status}
  </span>
);

export const PriorityBadge = ({ priority, className }) => (
  <span className={cn(base, PRIORITY_STYLES[priority] || PRIORITY_STYLES.Medium, className)}>
    {priority}
  </span>
);

export const Badge = ({ children, className }) => (
  <span className={cn(base, "bg-slate-100 text-slate-700 ring-slate-500/20", className)}>
    {children}
  </span>
);
