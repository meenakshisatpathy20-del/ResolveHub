import { CheckCircle2, ShieldCheck } from "lucide-react";

const POINTS = [
  "Raise a payment dispute in minutes, with evidence attached",
  "Merchants, banks and gateways work on one shared case",
  "Track every status change and get notified instantly",
];

function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-screen bg-white">
      {/* Brand panel */}
      <div className="relative hidden w-[44%] overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/10" />
        <div className="absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-white/5" />

        <div className="relative flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold">ResolveHub</span>
        </div>

        <div className="relative">
          <h2 className="text-4xl font-bold leading-tight">
            Payment disputes,
            <br />
            resolved together.
          </h2>
          <p className="mt-4 max-w-md text-blue-100">
            One workspace for customers and every organization involved in a transaction.
          </p>

          <ul className="mt-10 space-y-4">
            {POINTS.map((point) => (
              <li key={point} className="flex items-start gap-3 text-blue-50">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-200" />
                {point}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-blue-200">© {new Date().getFullYear()} ResolveHub</p>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold">ResolveHub</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-slate-500">{subtitle}</p>}

          <div className="mt-8">{children}</div>

          {footer && <div className="mt-8 text-center text-sm text-slate-600">{footer}</div>}
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
