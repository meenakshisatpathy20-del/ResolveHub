import { useCallback, useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Download, FileBarChart, IndianRupee, Percent, Printer, Timer } from "lucide-react";
import { toast } from "sonner";

import API, { errorMessage } from "../../services/api";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";
import { EmptyState, ErrorState, PageLoader, Spinner } from "../../components/common/States";
import { formatCurrency } from "../../lib/utils";

const STATUS_COLORS = {
  Open: "#2563eb",
  "In Progress": "#d97706",
  "Awaiting Customer": "#ea580c",
  "Awaiting Merchant": "#7c3aed",
  "Awaiting Bank": "#8b5cf6",
  "Awaiting Gateway": "#a78bfa",
  Resolved: "#059669",
  Rejected: "#dc2626",
};

const ChartCard = ({ title, description, children }) => (
  <section className="card p-5">
    <h2 className="font-semibold text-slate-900">{title}</h2>
    {description && <p className="text-sm text-slate-500">{description}</p>}
    <div className="mt-4 h-72">{children}</div>
  </section>
);

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid #e2e8f0",
  boxShadow: "0 4px 12px rgb(15 23 42 / 0.08)",
  fontSize: 13,
};

function Reports() {
  const [range, setRange] = useState({ from: "", to: "" });
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);

  const load = useCallback(async () => {
    setError("");
    try {
      const res = await API.get("/reports/summary", { params: range });
      setData(res.data);
    } catch (err) {
      setError(errorMessage(err));
    }
  }, [range]);

  useEffect(() => {
    load();
  }, [load]);

  const exportCsv = async () => {
    setExporting(true);
    try {
      const res = await API.get("/reports/export/csv", { params: range, responseType: "blob" });
      const url = URL.createObjectURL(res.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = `resolvehub-disputes-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!data) return <PageLoader label="Building your report…" />;

  const { totals } = data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & analytics"
        description="Dispute trends and outcomes for the cases you have access to."
        actions={
          <>
            <button className="btn-secondary" onClick={() => window.print()}>
              <Printer className="h-4 w-4" /> Print / PDF
            </button>
            <button className="btn-primary" onClick={exportCsv} disabled={exporting || !totals.total}>
              {exporting ? <Spinner className="h-4 w-4" /> : <Download className="h-4 w-4" />} Export CSV
            </button>
          </>
        }
      />

      <div className="card no-print flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
        <div>
          <label className="label" htmlFor="from">From</label>
          <input id="from" type="date" className="input" value={range.from} max={range.to || undefined} onChange={(e) => setRange((r) => ({ ...r, from: e.target.value }))} />
        </div>
        <div>
          <label className="label" htmlFor="to">To</label>
          <input id="to" type="date" className="input" value={range.to} min={range.from || undefined} onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))} />
        </div>
        {(range.from || range.to) && (
          <button className="btn-ghost" onClick={() => setRange({ from: "", to: "" })}>Clear dates</button>
        )}
        <p className="text-sm text-slate-500 sm:ml-auto">
          {range.from || range.to ? "Filtered by date raised" : "Showing all time"}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Disputes" value={totals.total} icon={FileBarChart} tone="blue" />
        <StatCard title="Amount disputed" value={formatCurrency(totals.amount)} icon={IndianRupee} tone="violet" hint={`${formatCurrency(totals.resolvedAmount)} resolved`} />
        <StatCard title="Resolution rate" value={`${totals.resolutionRate}%`} icon={Percent} tone="emerald" hint="Resolved out of closed cases" />
        <StatCard title="Avg. time to resolve" value={totals.avgResolutionDays === null ? "—" : totals.avgResolutionDays < 1 ? "< 1 day" : `${totals.avgResolutionDays} days`} icon={Timer} tone="amber" />
      </div>

      {totals.total === 0 ? (
        <div className="card">
          <EmptyState icon={FileBarChart} title="No data for this period" description="Reports will populate as disputes are raised and resolved." />
        </div>
      ) : (
        <>
          <ChartCard title="Monthly trend" description="Disputes raised vs. resolved over the last 6 months">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthly} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} width={32} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#f1f5f9" }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 13 }} />
                <Bar dataKey="raised" name="Raised" fill="#2563eb" radius={[6, 6, 0, 0]} maxBarSize={36} />
                <Bar dataKey="resolved" name="Resolved" fill="#059669" radius={[6, 6, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <div className="grid gap-6 lg:grid-cols-2">
            <ChartCard title="By status">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.byStatus} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="85%" paddingAngle={data.byStatus.length > 1 ? 2 : 0} isAnimationActive={false}>
                    {data.byStatus.map((entry) => <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || "#94a3b8"} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend iconType="circle" layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ fontSize: 13 }} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="By issue type">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.byIssue} layout="vertical" margin={{ left: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis type="category" dataKey="name" width={150} tickLine={false} axisLine={false} fontSize={12} />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    cursor={{ fill: "#f1f5f9" }}
                    formatter={(value, name, item) => [`${value} (${formatCurrency(item.payload.amount)})`, "Disputes"]}
                  />
                  <Bar dataKey="value" name="Disputes" fill="#6366f1" radius={[0, 6, 6, 0]} maxBarSize={22} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </>
      )}
    </div>
  );
}

export default Reports;
