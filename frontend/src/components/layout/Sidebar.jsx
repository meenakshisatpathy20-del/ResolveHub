import {
  LayoutDashboard,
  FileText,
  BarChart3,
  Bell,
  Settings,
  LifeBuoy,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { NavLink } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  const { logout } = useAuth();

  const menus = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
    },
    {
      title: "My Disputes",
      icon: FileText,
      path: "/dashboard/disputes",
    },
    {
      title: "Reports",
      icon: BarChart3,
      path: "/dashboard/reports",
    },
    {
      title: "Notifications",
      icon: Bell,
      path: "/dashboard/notifications",
    },
    {
      title: "Settings",
      icon: Settings,
      path: "/dashboard/settings",
    },
    {
      title: "Support",
      icon: LifeBuoy,
      path: "/dashboard/support",
    },
  ];

  return (
    <aside
      className={`sticky top-0 flex h-screen flex-col border-r border-slate-200 bg-white transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Logo */}

      <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">

        {!collapsed && (
          <div>

            <h1 className="text-xl font-bold text-blue-600">
              ResolveHub
            </h1>

            <p className="text-xs text-slate-500">
              Enterprise Platform
            </p>

          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-lg p-2 hover:bg-slate-100"
        >
          {collapsed ? (
            <ChevronRight size={18} />
          ) : (
            <ChevronLeft size={18} />
          )}
        </button>
      </div>

      {/* Navigation */}

      <nav className="mt-6 flex-1 px-3">

        {menus.map((menu) => (
          <NavLink
            key={menu.title}
            to={menu.path}
            className={({ isActive }) =>
              `mb-2 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-100"
              }`
            }
          >
            <menu.icon size={20} />

            {!collapsed && menu.title}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}

      <div className="border-t border-slate-200 p-3">

        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
        >
          <LogOut size={20} />

          {!collapsed && "Logout"}
        </button>

      </div>

    </aside>
  );
}

export default Sidebar;