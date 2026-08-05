import {
  Lock,
  Mail,
  Phone,
  User,
  Save,
} from "lucide-react";

function Settings() {
  return (
    <div className="space-y-6">

      <div>

        <h1 className="text-3xl font-semibold">
          Settings
        </h1>

        <p className="mt-2 text-slate-500">
          Update your account information.
        </p>

      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-8">

        <div className="grid gap-6 md:grid-cols-2">

          <div>

            <label className="mb-2 block text-sm font-medium">
              Full Name
            </label>

            <div className="relative">

              <User
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                className="h-12 w-full rounded-xl border border-slate-300 pl-11 pr-4"
                defaultValue="John Doe"
              />

            </div>

          </div>

          <div>

            <label className="mb-2 block text-sm font-medium">
              Email
            </label>

            <div className="relative">

              <Mail
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                className="h-12 w-full rounded-xl border border-slate-300 pl-11 pr-4"
                defaultValue="john@email.com"
              />

            </div>

          </div>

          <div>

            <label className="mb-2 block text-sm font-medium">
              Phone
            </label>

            <div className="relative">

              <Phone
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                className="h-12 w-full rounded-xl border border-slate-300 pl-11 pr-4"
                defaultValue="+91 9876543210"
              />

            </div>

          </div>

          <div>

            <label className="mb-2 block text-sm font-medium">
              New Password
            </label>

            <div className="relative">

              <Lock
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="password"
                className="h-12 w-full rounded-xl border border-slate-300 pl-11 pr-4"
              />

            </div>

          </div>

        </div>

        <button className="mt-8 flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-white hover:bg-blue-700">

          <Save size={18} />

          Save Changes

        </button>

      </div>

    </div>
  );
}

export default Settings;