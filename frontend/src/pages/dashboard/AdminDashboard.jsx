import {
  Building2,
  Users,
  ShieldCheck,
  FileWarning,
} from "lucide-react";

function AdminDashboard() {
  const stats = [
    {
      title: "Organizations",
      value: 18,
      icon: Building2,
      color: "text-blue-600",
    },
    {
      title: "Users",
      value: 284,
      icon: Users,
      color: "text-green-600",
    },
    {
      title: "Open Disputes",
      value: 42,
      icon: FileWarning,
      color: "text-orange-600",
    },
    {
      title: "Pending Approvals",
      value: 5,
      icon: ShieldCheck,
      color: "text-red-600",
    },
  ];

  return (
    <div className="space-y-8">

      <div>

        <h1 className="text-3xl font-bold">
          Admin Dashboard
        </h1>

        <p className="mt-2 text-slate-500">
          Manage organizations, users and dispute operations.
        </p>

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
          Pending Organization Approvals
        </h2>

        <p className="text-slate-500">
          Organization approval requests will appear here.
        </p>

      </div>

    </div>
  );
}

export default AdminDashboard;