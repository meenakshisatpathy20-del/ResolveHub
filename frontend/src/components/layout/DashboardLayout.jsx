import { useCallback, useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import API from "../../services/api";
import { NOTIFICATIONS_CHANGED } from "../../lib/constants";

function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const { pathname } = useLocation();

  const refreshUnread = useCallback(() => {
    API.get("/notifications/unread-count")
      .then((res) => setUnread(res.data.unread))
      .catch(() => {});
  }, []);

  // Refresh on navigation, on demand, and every 30 seconds
  useEffect(() => {
    refreshUnread();
  }, [pathname, refreshUnread]);

  useEffect(() => {
    const timer = setInterval(refreshUnread, 30000);
    window.addEventListener(NOTIFICATIONS_CHANGED, refreshUnread);

    return () => {
      clearInterval(timer);
      window.removeEventListener(NOTIFICATIONS_CHANGED, refreshUnread);
    };
  }, [refreshUnread]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} unread={unread} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar onMenu={() => setSidebarOpen(true)} unread={unread} />

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
