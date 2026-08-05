import { Bell, ChevronDown, Phone } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useState, useEffect } from "react";

function Navbar() {
  const { user, logout } = useAuth();

  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-8">

      {/* Left */}

      <div>

        <h1 className="text-xl font-semibold text-slate-900">
          Dashboard
        </h1>

        <p className="text-sm text-slate-500">
          ResolveHub Enterprise
        </p>

      </div>

      {/* Right */}

      <div className="flex items-center gap-6">

        {/* Contact */}

        <button className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-100">

          <Phone size={16} />

          Contact Support

        </button>

        {/* Date */}

        <div className="text-right">

          <p className="text-sm font-medium text-slate-900">

            {time.toLocaleDateString()}

          </p>

          <p className="text-xs text-slate-500">

            {time.toLocaleTimeString()}

          </p>

        </div>

        {/* Notification */}

        <button className="relative rounded-xl border border-slate-200 p-2 hover:bg-slate-100">

          <Bell size={20} />

          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500"></span>

        </button>

        {/* Profile */}

        <button className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2 hover:bg-slate-100">

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white font-semibold">

            {user?.fullName?.charAt(0)}

          </div>

          <div className="text-left">

            <p className="text-sm font-semibold">

              {user?.fullName}

            </p>

            <p className="text-xs text-slate-500">

              {user?.role}

            </p>

          </div>

          <ChevronDown size={18} />

        </button>

      </div>

    </header>
  );
}

export default Navbar;