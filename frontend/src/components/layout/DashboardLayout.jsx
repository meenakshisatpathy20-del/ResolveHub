import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

function DashboardLayout() {
  return (
    <div className="min-h-screen bg-slate-50">

      <div className="flex">

        {/* Sidebar */}

        <Sidebar />

        {/* Main Content */}

        <div className="flex min-h-screen flex-1 flex-col">

          {/* Header */}

          <Navbar />

          {/* Page */}

          <main className="flex-1 p-8">

            <div className="mx-auto max-w-7xl">

              <Outlet />

            </div>

          </main>

        </div>

      </div>

    </div>
  );
}

export default DashboardLayout;