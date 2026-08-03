import {
  Search,
  Bell,
  Plus,
  Menu,
  ChevronDown,
  CalendarDays,
} from "lucide-react";

function Navbar() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-6 backdrop-blur">

      {/* Left */}

      <div className="flex items-center gap-4">

        <button className="rounded-lg p-2 transition hover:bg-slate-100 lg:hidden">
          <Menu size={20} />
        </button>

        <div>

          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            ResolveHub
          </p>

          <h1 className="text-lg font-semibold text-slate-900">
            Dashboard
          </h1>

        </div>

      </div>

      {/* Center */}

      <div className="hidden w-full max-w-xl lg:block">

        <div className="relative">

          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            placeholder="Search disputes, organizations, users..."
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
          />

        </div>

      </div>

      {/* Right */}

      <div className="flex items-center gap-3">

        {/* Date */}

        <div className="hidden items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600 xl:flex">

          <CalendarDays size={16} />

          {new Date().toLocaleDateString()}

        </div>

        {/* New Dispute */}

        <button className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700">

          <Plus size={18} />

          New Dispute

        </button>

        {/* Notifications */}

        <button className="relative rounded-xl border border-slate-200 p-3 transition hover:bg-slate-100">

          <Bell size={19} />

          <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-red-500"></span>

        </button>

        {/* User */}

        <button className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2 transition hover:bg-slate-100">

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-semibold text-white">
            JD
          </div>

          <div className="hidden text-left lg:block">

            <h3 className="text-sm font-semibold">
              John Doe
            </h3>

            <p className="text-xs text-slate-500">
              Bank Officer
            </p>

          </div>

          <ChevronDown size={16} />

        </button>

      </div>

    </header>
  );
}

export default Navbar;