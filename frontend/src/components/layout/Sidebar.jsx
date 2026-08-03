import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  PlusCircle,
  FolderKanban,
  Building2,
  Bell,
  BarChart3,
  User,
  Settings,
  Bot,
  ShieldCheck,
  LogOut,
  ChevronLeft,
} from "lucide-react";

const menuItems = [
  {
    title: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Raise Dispute",
    path: "/dashboard/raise-dispute",
    icon: PlusCircle,
  },
  {
    title: "My Disputes",
    path: "/dashboard/disputes",
    icon: FolderKanban,
  },
  {
    title: "Organizations",
    path: "/dashboard/organizations",
    icon: Building2,
  },
  {
    title: "Reports",
    path: "/dashboard/reports",
    icon: BarChart3,
  },
  {
    title: "Notifications",
    path: "/dashboard/notifications",
    icon: Bell,
  },
  {
    title: "AI Assistant",
    path: "/dashboard/ai-assistant",
    icon: Bot,
  },
  {
    title: "Profile",
    path: "/dashboard/profile",
    icon: User,
  },
  {
    title: "Settings",
    path: "/dashboard/settings",
    icon: Settings,
  },
];

function Sidebar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <aside className="hidden lg:flex h-screen w-72 flex-col border-r border-slate-200 bg-white shadow-sm">

      {/* Logo */}

      <div className="border-b border-slate-200 px-6 py-6">

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-4">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-xl font-bold text-white">
              R
            </div>

            <div>

              <h1 className="text-xl font-bold tracking-tight">
                ResolveHub
              </h1>

              <p className="text-xs text-slate-500">
                Unified Dispute Resolution
              </p>

            </div>

          </div>

          <button className="rounded-lg p-2 transition hover:bg-slate-100">
            <ChevronLeft size={18} />
          </button>

        </div>

      </div>

      {/* Navigation */}

      <div className="flex-1 overflow-y-auto px-4 py-6">

        <p className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Workspace
        </p>

        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `mb-2 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-slate-600 hover:bg-slate-100"
                }`
              }
            >
              <Icon size={19} />

              {item.title}
            </NavLink>
          );
        })}

      </div>

      {/* Bottom User */}

      <div className="border-t border-slate-200 p-5">

        <div className="mb-5 flex items-center gap-3 rounded-xl bg-slate-50 p-3">

          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">
            JD
          </div>

          <div className="flex-1">

            <h3 className="font-semibold">
              John Doe
            </h3>

            <p className="flex items-center gap-1 text-xs text-slate-500">

              <ShieldCheck size={14} />

              Bank Officer

            </p>

          </div>

        </div>

        <button
          onClick={logout}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 py-3 font-medium text-red-600 transition hover:bg-red-50"
        >
          <LogOut size={18} />

          Logout
        </button>

      </div>

    </aside>
  );
}

export default Sidebar;