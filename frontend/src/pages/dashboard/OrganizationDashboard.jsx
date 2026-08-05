import { Users, Briefcase, Clock3, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

function OrganizationDashboard() {
  const navigate = useNavigate();

  const stats = [
    {
      title: "Assigned Cases",
      value: 24,
      icon: Briefcase,
      color: "text-blue-600",
    },
    {
      title: "Pending",
      value: 8,
      icon: Clock3,
      color: "text-yellow-600",
    },
    {
      title: "Resolved",
      value: 15,
      icon: CheckCircle2,
      color: "text-green-600",
    },
    {
      title: "Employees",
      value: 12,
      icon: Users,
      color: "text-purple-600",
    },
  ];

  return (
    <div className="space-y-8">

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-3xl font-bold">
            Organization Dashboard
          </h1>

          <p className="mt-2 text-slate-500">
            Manage assigned disputes and employees.
          </p>

        </div>

        <button
          onClick={() => navigate("/dashboard/organizations")}
          className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
        >
          Manage Organization
        </button>

      </div>

      <div className="grid gap-6 lg:grid-cols-4">

        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-200 bg-white p-6"
            >
              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm text-slate-500">
                    {item.title}
                  </p>

                  <h2 className="mt-2 text-3xl font-bold">
                    {item.value}
                  </h2>

                </div>

                <Icon
                  className={item.color}
                  size={24}
                />

              </div>
            </div>
          );
        })}

      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">

        <h2 className="mb-5 text-lg font-semibold">
          Assigned Disputes
        </h2>

        <p className="text-slate-500">
          Assigned dispute table will load from MongoDB.
        </p>

      </div>

    </div>
  );
}

export default OrganizationDashboard;