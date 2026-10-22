import { useState } from "react";
import { Building2, ShieldCheck, UserCog, UserRound } from "lucide-react";

import { Spinner } from "../../components/common/States";

// Shared demo accounts created by `npm run seed` in the backend.
// Hide this panel by building the frontend with VITE_DEMO_MODE=false.
const DEMO_PASSWORD = import.meta.env.VITE_DEMO_PASSWORD || "Demo@1234";

const DEMO_ACCOUNTS = [
  {
    role: "Customer",
    email: "customer@resolvehub.example",
    description: "Raise and track disputes",
    icon: UserRound,
    tone: "bg-blue-50 text-blue-600",
  },
  {
    role: "Org Admin",
    email: "admin@shopkart.example",
    description: "ShopKart · assign cases",
    icon: Building2,
    tone: "bg-violet-50 text-violet-600",
  },
  {
    role: "Employee",
    email: "agent@shopkart.example",
    description: "ShopKart · resolve cases",
    icon: UserCog,
    tone: "bg-amber-50 text-amber-600",
  },
  {
    role: "Platform Admin",
    email: "admin@resolvehub.example",
    description: "Organizations & reports",
    icon: ShieldCheck,
    tone: "bg-emerald-50 text-emerald-600",
  },
];

export const demoModeEnabled = import.meta.env.VITE_DEMO_MODE !== "false";

function DemoLogin({ onLogin, disabled }) {
  const [active, setActive] = useState(null);

  if (!demoModeEnabled) return null;

  const choose = async (account) => {
    setActive(account.email);
    try {
      await onLogin(account.email, DEMO_PASSWORD);
    } finally {
      setActive(null);
    }
  };

  return (
    <div className="mb-8 rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
      <p className="text-sm font-semibold text-slate-900">Try the live demo</p>
      <p className="mt-0.5 text-xs text-slate-500">
        One click, no sign-up. Each role sees the app differently.
      </p>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {DEMO_ACCOUNTS.map((account) => (
          <button
            key={account.email}
            type="button"
            onClick={() => choose(account)}
            disabled={disabled || Boolean(active)}
            className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white p-2.5 text-left transition hover:border-blue-300 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${account.tone}`}>
              {active === account.email ? <Spinner className="h-4 w-4" /> : <account.icon className="h-4 w-4" />}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-slate-800">{account.role}</span>
              <span className="block truncate text-[11px] text-slate-500">{account.description}</span>
            </span>
          </button>
        ))}
      </div>

      <p className="mt-3 text-[11px] text-slate-400">
        The server may take up to a minute to wake up on the first visit.
      </p>
    </div>
  );
}

export default DemoLogin;
