import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlarmClock,
  ArrowRight,
  Building2,
  CheckCircle2,
  CircleDot,
  FilePlus2,
  FileText,
  Flame,
  Loader,
  UserX,
  Users,
} from "lucide-react";

import API, { errorMessage } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import StatCard from "../../components/common/StatCard";
import DisputeTable from "../../components/common/DisputeTable";
import { EmptyState, ErrorState, PageLoader } from "../../components/common/States";

const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const res = await API.get("/disputes/dashboard-summary");
      setData(res.data);
    } catch (err) {
      setError(errorMessage(err));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!data) return <PageLoader label="Loading your dashboard…" />;

  const { summary, recentDisputes } = data;
  const role = user.role;
  const isCustomer = role === "Customer";
  const goTo = (status) => navigate(`/dashboard/disputes${status ? `?status=${encodeURIComponent(status)}` : ""}`);

  const subtitle = {
    Customer: "Here's where your payment disputes stand.",
    Employee: "Cases assigned to you.",
    OrganizationAdmin: `Disputes involving ${user.organization?.organizationName || "your organization"}.`,
    Admin: "Platform-wide overview.",
  }[role];

  const cards = [
    { title: "Total disputes", value: summary.total, icon: FileText, tone: "blue", onClick: () => goTo() },
    { title: "Open", value: summary.open, icon: CircleDot, tone: "violet", onClick: () => goTo("Open") },
    { title: "In progress", value: summary.inProgress, icon: Loader, tone: "amber", onClick: () => goTo("active") },
    { title: "Resolved", value: summary.resolved, icon: CheckCircle2, tone: "emerald", onClick: () => goTo("Resolved") },
  ];

  const secondary = [
    { title: "High / critical (active)", value: summary.highPriority, icon: Flame, tone: "red" },
    { title: "Past SLA deadline", value: summary.overdue, icon: AlarmClock, tone: summary.overdue ? "red" : "slate" },
  ];

  if (role === "OrganizationAdmin" || role === "Admin") {
    secondary.push({ title: "Unassigned (active)", value: summary.unassigned, icon: UserX, tone: "amber" });
  }

  if (role === "Admin") {
    secondary.push(
      { title: "Users", value: summary.users, icon: Users, tone: "blue" },
      { title: "Organizations", value: summary.organizations, icon: Building2, tone: "violet", onClick: () => navigate("/dashboard/organizations") }
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex flex-col gap-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <h2 className="text-2xl font-bold">
            {greeting()}, {user.fullName.split(" ")[0]} 👋
          </h2>
          <p className="mt-1 text-blue-100">{subtitle}</p>
        </div>
        {isCustomer ? (
          <Link to="/dashboard/raise-dispute" className="btn h-11 bg-white text-blue-700 shadow-sm hover:bg-blue-50">
            <FilePlus2 className="h-4 w-4" /> Raise a dispute
          </Link>
        ) : (
          <Link to="/dashboard/disputes?status=active" className="btn h-11 bg-white text-blue-700 shadow-sm hover:bg-blue-50">
            View active cases <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => <StatCard key={card.title} {...card} />)}
      </div>

      <div className={`grid gap-4 sm:grid-cols-2 ${secondary.length > 3 ? "xl:grid-cols-5" : "xl:grid-cols-3"}`}>
        {secondary.map((card) => <StatCard key={card.title} {...card} />)}
      </div>

      {/* Recent */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h3 className="font-semibold text-slate-900">Recent activity</h3>
            <p className="text-sm text-slate-500">Most recently updated disputes</p>
          </div>
          {recentDisputes.length > 0 && (
            <Link to="/dashboard/disputes" className="text-sm font-semibold text-blue-600 hover:underline">
              View all
            </Link>
          )}
        </div>

        {recentDisputes.length ? (
          <DisputeTable disputes={recentDisputes} showCustomer={!isCustomer} />
        ) : (
          <EmptyState
            title={isCustomer ? "No disputes yet" : "No cases yet"}
            description={
              isCustomer
                ? "If a payment went wrong — failed, charged twice, or a refund never arrived — raise a dispute and we'll route it to the right organizations."
                : "Disputes will appear here once they involve your organization or are assigned to you."
            }
            action={
              isCustomer && (
                <Link to="/dashboard/raise-dispute" className="btn-primary">
                  <FilePlus2 className="h-4 w-4" /> Raise your first dispute
                </Link>
              )
            }
          />
        )}
      </div>
    </div>
  );
}

export default Dashboard;
