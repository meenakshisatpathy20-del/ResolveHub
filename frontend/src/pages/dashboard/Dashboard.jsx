import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";

import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  ShieldAlert,
  Search,
} from "lucide-react";

function Dashboard() {
  const navigate = useNavigate();

  const [summary, setSummary] = useState({
    total: 0,
    open: 0,
    resolved: 0,
    highPriority: 0,
  });

  const [disputes, setDisputes] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);

      const summaryRes = await API.get(
        "/disputes/dashboard-summary"
      );

      const disputesRes = await API.get(
        "/disputes"
      );

      setSummary(summaryRes.data.summary);

      setDisputes(disputesRes.data.disputes);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      title: "Open",
      value: summary.open,
      icon: AlertCircle,
      color: "text-orange-600",
    },
    {
      title: "Total",
      value: summary.total,
      icon: Clock3,
      color: "text-blue-600",
    },
    {
      title: "Resolved",
      value: summary.resolved,
      icon: CheckCircle2,
      color: "text-green-600",
    },
    {
      title: "High Priority",
      value: summary.highPriority,
      icon: ShieldAlert,
      color: "text-red-600",
    },
  ];

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <p className="text-slate-500 text-lg">
          Loading Dashboard...
        </p>
      </div>
    );
  }
    return (
    <div className="space-y-8">

      {/* Header */}

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-3xl font-bold text-slate-900">
            Good Evening 👋
          </h1>

          <p className="mt-2 text-slate-500">
            Track, manage and monitor all your payment disputes.
          </p>

        </div>

        <button
          onClick={() => navigate("/dashboard/raise-dispute")}
          className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
        >
          + Raise Dispute
        </button>

      </div>

      {/* KPI */}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

        {stats.map((item) => {

          const Icon = item.icon;

          return (

            <div
              key={item.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm text-slate-500">
                    {item.title}
                  </p>

                  <h2 className="mt-3 text-3xl font-bold">
                    {item.value}
                  </h2>

                </div>

                <div className="rounded-xl bg-slate-100 p-3">

                  <Icon
                    size={24}
                    className={item.color}
                  />

                </div>

              </div>

            </div>

          );

        })}

      </div>

      {/* Search */}

      <div className="flex flex-col gap-4 lg:flex-row">

        <div className="relative flex-1">

          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            placeholder="Search disputes..."
            className="h-12 w-full rounded-xl border border-slate-300 pl-11 pr-4 outline-none focus:border-blue-600"
          />

        </div>

        <select className="h-12 rounded-xl border border-slate-300 px-4">

          <option>All Status</option>

          <option>Open</option>

          <option>Under Review</option>

          <option>Resolved</option>

        </select>

      </div>

      {/* Recent Disputes */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

          <h2 className="text-lg font-semibold">
            Recent Disputes
          </h2>

          <button
            onClick={() =>
              navigate("/dashboard/disputes")
            }
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            View All
          </button>

        </div>

        <table className="w-full">

          <thead className="bg-slate-50">

            <tr>

              <th className="px-6 py-4 text-left text-sm font-semibold">
                ID
              </th>

              <th className="text-left text-sm font-semibold">
                Merchant
              </th>

              <th className="text-left text-sm font-semibold">
                Status
              </th>

              <th className="text-left text-sm font-semibold">
                Priority
              </th>

              <th className="text-left text-sm font-semibold">
                Updated
              </th>

            </tr>

          </thead>

          <tbody>

            {disputes.slice(0, 5).map((item) => (

              <tr
                key={item._id}
                className="border-b hover:bg-slate-50"
              >

                <td className="px-6 py-4 font-medium">
                  {item.disputeId}
                </td>

                <td>{item.merchant}</td>

                <td>

                  <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">

                    {item.status}

                  </span>

                </td>

                <td>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      item.priority === "Critical"
                        ? "bg-red-100 text-red-700"
                        : item.priority === "High"
                        ? "bg-orange-100 text-orange-700"
                        : item.priority === "Medium"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {item.priority}
                  </span>

                </td>

                <td>

                  {new Date(
                    item.updatedAt
                  ).toLocaleDateString()}

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      {/* Activity */}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        <h2 className="mb-5 text-lg font-semibold">
          Recent Activity
        </h2>

        <div className="space-y-4">

          {disputes.slice(0, 4).map((item) => (

            <div
              key={item._id}
              className="flex items-center justify-between border-b pb-4 last:border-0"
            >

              <div>

                <p className="font-medium">

                  {item.disputeId}

                </p>

                <p className="text-sm text-slate-500">

                  {item.status}

                </p>

              </div>

              <span className="text-sm text-slate-400">

                {new Date(
                  item.updatedAt
                ).toLocaleDateString()}

              </span>

            </div>

          ))}

        </div>

      </div>
          </div>
  );
}

export default Dashboard;