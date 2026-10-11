import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, FilePlus2, Search, SearchX, X } from "lucide-react";

import API, { errorMessage } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import PageHeader from "../../components/common/PageHeader";
import DisputeTable from "../../components/common/DisputeTable";
import { EmptyState, ErrorState, Spinner } from "../../components/common/States";
import { DISPUTE_STATUSES, PRIORITIES } from "../../lib/constants";

const TITLES = {
  Customer: ["My Disputes", "Every dispute you've raised and its current status."],
  Employee: ["My Cases", "Disputes assigned to you."],
  OrganizationAdmin: ["Cases", "All disputes involving your organization."],
  Admin: ["All Disputes", "Every dispute on the platform."],
};

function Disputes() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();

  const status = params.get("status") || "";
  const priority = params.get("priority") || "";
  const search = params.get("search") || "";
  const page = Number(params.get("page")) || 1;

  const [searchInput, setSearchInput] = useState(search);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const update = (changes) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([key, value]) => (value ? next.set(key, value) : next.delete(key)));
    if (!("page" in changes)) next.delete("page");
    setParams(next, { replace: true });
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await API.get("/disputes", { params: { status, priority, search, page, limit: 15 } });
      setData(res.data);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [status, priority, search, page]);

  useEffect(() => {
    load();
  }, [load]);

  // Debounce search typing
  useEffect(() => {
    if (searchInput === search) return;
    const timer = setTimeout(() => update({ search: searchInput.trim() }), 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const [title, description] = TITLES[user.role] || TITLES.Customer;
  const hasFilters = status || priority || search;

  return (
    <div>
      <PageHeader
        title={title}
        description={description}
        actions={
          user.role === "Customer" && (
            <Link to="/dashboard/raise-dispute" className="btn-primary">
              <FilePlus2 className="h-4 w-4" /> Raise dispute
            </Link>
          )
        }
      />

      <div className="card overflow-hidden">
        {/* Filters */}
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            <input
              className="input pl-10"
              placeholder="Search by dispute ID, transaction ID, order ID or issue"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              aria-label="Search disputes"
            />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:flex">
            <select className="input sm:w-48" value={status} onChange={(e) => update({ status: e.target.value })} aria-label="Filter by status">
              <option value="">All statuses</option>
              <option value="active">Active (not closed)</option>
              {DISPUTE_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select className="input sm:w-40" value={priority} onChange={(e) => update({ priority: e.target.value })} aria-label="Filter by priority">
              <option value="">All priorities</option>
              {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          {hasFilters && (
            <button
              className="btn-ghost"
              onClick={() => {
                setSearchInput("");
                setParams({}, { replace: true });
              }}
            >
              <X className="h-4 w-4" /> Clear
            </button>
          )}
        </div>

        {error ? (
          <div className="p-4"><ErrorState message={error} onRetry={load} /></div>
        ) : !data ? (
          <div className="flex justify-center py-16"><Spinner className="h-7 w-7 text-blue-600" /></div>
        ) : data.disputes.length === 0 ? (
          hasFilters ? (
            <EmptyState icon={SearchX} title="No matching disputes" description="Try a different search or clear the filters." />
          ) : (
            <EmptyState
              title={user.role === "Customer" ? "You haven't raised any disputes" : "No cases yet"}
              description={user.role === "Customer" ? "Raise a dispute if a payment failed, was charged twice, or a refund is pending." : "Cases will show up here when they involve you."}
              action={user.role === "Customer" && <Link to="/dashboard/raise-dispute" className="btn-primary"><FilePlus2 className="h-4 w-4" /> Raise dispute</Link>}
            />
          )
        ) : (
          <div className={loading ? "opacity-60 transition" : "transition"}>
            <DisputeTable disputes={data.disputes} showCustomer={user.role !== "Customer"} />

            <div className="flex items-center justify-between border-t border-slate-200 px-5 py-3 text-sm text-slate-600">
              <p>
                {data.total} dispute{data.total === 1 ? "" : "s"}
                {data.pages > 1 && ` · page ${data.page} of ${data.pages}`}
              </p>
              {data.pages > 1 && (
                <div className="flex gap-2">
                  <button className="btn-secondary h-9 px-3" disabled={page <= 1} onClick={() => update({ page: String(page - 1) })} aria-label="Previous page">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button className="btn-secondary h-9 px-3" disabled={page >= data.pages} onClick={() => update({ page: String(page + 1) })} aria-label="Next page">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Disputes;
