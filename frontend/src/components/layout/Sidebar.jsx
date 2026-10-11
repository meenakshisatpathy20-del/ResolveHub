import { NavLink } from "react-router-dom";
import { LogOut, ShieldCheck, X } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { getMenu } from "./navigation";
import { cn, ROLE_LABELS } from "../../lib/utils";

function Sidebar({ open, onClose, unread }) {
  const { user, logout } = useAuth();
  const menu = getMenu(user?.role);

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-slate-900/40 transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-base font-bold leading-tight text-slate-900">ResolveHub</p>
              <p className="text-[11px] text-slate-500">Payment dispute resolution</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 lg:hidden" aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Organization chip for staff */}
        {user?.organization?.organizationName && (
          <div className="mx-3 mt-4 rounded-xl bg-slate-50 px-3 py-2.5">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Organization</p>
            <p className="truncate text-sm font-semibold text-slate-800">{user.organization.organizationName}</p>
          </div>
        )}

        {/* Navigation */}
        <nav className="mt-4 flex-1 space-y-1 overflow-y-auto px-3">
          {menu.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition",
                  isActive ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )
              }
            >
              <item.icon className="h-[18px] w-[18px]" />
              <span className="flex-1">{item.title}</span>
              {item.title === "Notifications" && unread > 0 && (
                <span className="rounded-full bg-red-500 px-2 py-0.5 text-[11px] font-semibold text-white">
                  {unread > 99 ? "99+" : unread}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User + logout */}
        <div className="border-t border-slate-200 p-3">
          <div className="mb-2 px-3 py-1">
            <p className="truncate text-sm font-semibold text-slate-800">{user?.fullName}</p>
            <p className="text-xs text-slate-500">{ROLE_LABELS[user?.role]}</p>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
          >
            <LogOut className="h-[18px] w-[18px]" />
            Log out
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
