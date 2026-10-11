import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Bell, ChevronDown, LogOut, Menu, Settings, LifeBuoy } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { getPageTitle } from "./navigation";
import { initials, ROLE_LABELS } from "../../lib/utils";

function Navbar({ onMenu, unread }) {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button onClick={onMenu} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden" aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="truncate text-lg font-semibold text-slate-900">{getPageTitle(pathname, user?.role)}</h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          to="/dashboard/notifications"
          className="relative rounded-xl p-2.5 text-slate-600 hover:bg-slate-100"
          aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
        >
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Link>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2.5 rounded-xl p-1.5 pr-2 hover:bg-slate-100"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            {user?.profileImage ? (
              <img src={user.profileImage} alt="" className="h-9 w-9 rounded-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                {initials(user?.fullName)}
              </div>
            )}
            <div className="hidden text-left sm:block">
              <p className="max-w-40 truncate text-sm font-semibold text-slate-900">{user?.fullName}</p>
              <p className="text-xs text-slate-500">{ROLE_LABELS[user?.role]}</p>
            </div>
            <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" />
          </button>

          {menuOpen && (
            <div role="menu" className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
              <div className="border-b border-slate-100 px-4 py-3">
                <p className="truncate text-sm font-semibold">{user?.fullName}</p>
                <p className="truncate text-xs text-slate-500">{user?.email}</p>
              </div>
              <Link to="/dashboard/settings" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                <Settings className="h-4 w-4" /> Settings
              </Link>
              <Link to="/dashboard/support" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                <LifeBuoy className="h-4 w-4" /> Help & Support
              </Link>
              <button onClick={logout} className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">
                <LogOut className="h-4 w-4" /> Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
