import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

function DashboardLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">

      {/* Sidebar */}

      <Sidebar />

      {/* Main */}

      <div className="flex flex-1 flex-col">

        {/* Top Navbar */}

        <Navbar />

        {/* Page Content */}

        <main className="flex-1 overflow-y-auto bg-slate-50 p-6 lg:p-8">

          <Outlet />

        </main>

      </div>

    </div>
  );
}

export default DashboardLayout;