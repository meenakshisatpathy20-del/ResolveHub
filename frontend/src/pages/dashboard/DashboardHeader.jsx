import { Search, Plus, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";

function DashboardHeader() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

      <div>

        <h1 className="text-2xl font-bold text-slate-900">
          Command Center
        </h1>

        <p className="text-sm text-slate-500">
          Monitor and manage all active dispute cases.
        </p>

      </div>

      <div className="flex items-center gap-3">

        <div className="relative">

          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            placeholder="Search Transaction ID, Order ID..."
            className="h-11 w-80 rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none focus:border-blue-500"
          />

        </div>

        <button
          onClick={() => navigate("/dashboard/raise-dispute")}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700"
        >

          <Plus size={18} />

          Raise Dispute

        </button>

        <button className="relative rounded-xl border border-slate-200 bg-white p-3">

          <Bell size={20} />

          <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-red-500"></span>

        </button>

      </div>

    </div>
  );
}

export default DashboardHeader;