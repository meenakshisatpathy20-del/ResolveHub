import { useNavigate } from "react-router-dom";
import { AlarmClock, ChevronRight } from "lucide-react";

import { StatusBadge, PriorityBadge } from "./Badges";
import { formatCurrency, formatDate, isOverdue } from "../../lib/utils";

// Responsive list of disputes: table on desktop, cards on mobile
function DisputeTable({ disputes, showCustomer = false }) {
  const navigate = useNavigate();
  const open = (d) => navigate(`/dashboard/disputes/${d._id}`);

  return (
    <>
      {/* Desktop */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/60 text-xs uppercase tracking-wide text-slate-500">
              <th className="px-5 py-3 font-medium">Dispute</th>
              {showCustomer && <th className="px-5 py-3 font-medium">Customer</th>}
              <th className="px-5 py-3 font-medium">Issue</th>
              <th className="px-5 py-3 text-right font-medium">Amount</th>
              <th className="px-5 py-3 font-medium">Priority</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Updated</th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {disputes.map((d) => (
              <tr
                key={d._id}
                onClick={() => open(d)}
                className="group cursor-pointer transition hover:bg-blue-50/40"
              >
                <td className="px-5 py-3.5">
                  <p className="font-semibold text-slate-900">{d.disputeId}</p>
                  <p className="text-xs text-slate-500">
                    Txn {d.transactionId}
                    {d.merchant?.organizationName && ` · ${d.merchant.organizationName}`}
                  </p>
                </td>
                {showCustomer && (
                  <td className="px-5 py-3.5 text-slate-700">{d.customer?.fullName || "—"}</td>
                )}
                <td className="px-5 py-3.5 text-slate-700">{d.issueType}</td>
                <td className="px-5 py-3.5 text-right font-medium tabular-nums text-slate-900">
                  {formatCurrency(d.amount, d.currency)}
                </td>
                <td className="px-5 py-3.5"><PriorityBadge priority={d.priority} /></td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={d.status} />
                    {isOverdue(d) && (
                      <AlarmClock className="h-4 w-4 text-red-500" aria-label="Past SLA deadline" />
                    )}
                  </div>
                </td>
                <td className="px-5 py-3.5 text-slate-500">{formatDate(d.updatedAt)}</td>
                <td className="pr-4">
                  <ChevronRight className="h-4 w-4 text-slate-300 transition group-hover:text-blue-500" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <ul className="divide-y divide-slate-100 md:hidden">
        {disputes.map((d) => (
          <li key={d._id}>
            <button onClick={() => open(d)} className="w-full px-4 py-4 text-left active:bg-slate-50">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900">{d.disputeId}</p>
                  <p className="truncate text-xs text-slate-500">{d.issueType} · Txn {d.transactionId}</p>
                </div>
                <p className="shrink-0 font-semibold tabular-nums">{formatCurrency(d.amount, d.currency)}</p>
              </div>
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <StatusBadge status={d.status} />
                <PriorityBadge priority={d.priority} />
                {isOverdue(d) && <span className="text-xs font-medium text-red-600">Overdue</span>}
                <span className="ml-auto text-xs text-slate-400">{formatDate(d.updatedAt)}</span>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}

export default DisputeTable;
