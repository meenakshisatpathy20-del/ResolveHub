import { AlertTriangle, Inbox, Loader2 } from "lucide-react";

export const Spinner = ({ className = "h-5 w-5" }) => (
  <Loader2 className={`animate-spin ${className}`} aria-hidden="true" />
);

export const PageLoader = ({ label = "Loading…" }) => (
  <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-slate-500">
    <Spinner className="h-8 w-8 text-blue-600" />
    <p className="text-sm">{label}</p>
  </div>
);

export const EmptyState = ({
  icon: Icon = Inbox,
  title,
  description,
  action,
}) => (
  <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
      <Icon className="h-7 w-7" />
    </div>
    <h3 className="text-base font-semibold text-slate-900">{title}</h3>
    {description && (
      <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>
    )}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

export const ErrorState = ({ message, onRetry }) => (
  <div className="card flex flex-col items-center px-6 py-12 text-center">
    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
      <AlertTriangle className="h-7 w-7" />
    </div>
    <h3 className="font-semibold text-slate-900">Couldn't load this page</h3>
    <p className="mt-1 max-w-sm text-sm text-slate-500">{message}</p>
    {onRetry && (
      <button onClick={onRetry} className="btn-secondary mt-5">
        Try again
      </button>
    )}
  </div>
);
