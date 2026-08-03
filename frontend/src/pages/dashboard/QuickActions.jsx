import { useNavigate } from "react-router-dom";
import {
  PlusCircle,
  Upload,
  FileText,
  Building2,
} from "lucide-react";

function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      title: "Raise Dispute",
      icon: PlusCircle,
      path: "/dashboard/raise-dispute",
    },
    {
      title: "Upload Evidence",
      icon: Upload,
      path: "/dashboard/disputes",
    },
    {
      title: "Generate Report",
      icon: FileText,
      path: "/dashboard/reports",
    },
    {
      title: "Organizations",
      icon: Building2,
      path: "/dashboard/organizations",
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">

      <h2 className="mb-5 text-lg font-semibold">
        Quick Actions
      </h2>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <button
              key={action.title}
              onClick={() => navigate(action.path)}
              className="rounded-xl border border-slate-200 p-5 text-left transition hover:border-blue-500 hover:bg-blue-50"
            >

              <Icon
                className="mb-4 text-blue-600"
                size={26}
              />

              <h3 className="font-semibold">
                {action.title}
              </h3>

            </button>
          );
        })}

      </div>

    </div>
  );
}

export default QuickActions;