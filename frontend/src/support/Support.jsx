import {
  Mail,
  Phone,
  MessageSquare,
} from "lucide-react";

function Support() {
  return (
    <div className="space-y-6">

      <div>

        <h1 className="text-3xl font-semibold">
          Contact Support
        </h1>

        <p className="mt-2 text-slate-500">
          Need help with a dispute? Reach our support team.
        </p>

      </div>

      <div className="grid gap-6 md:grid-cols-3">

        <div className="rounded-2xl border border-slate-200 bg-white p-6">

          <Mail
            className="text-blue-600"
            size={24}
          />

          <h2 className="mt-4 font-semibold">
            Email
          </h2>

          <p className="mt-2 text-slate-500">
            support@resolvehub.com
          </p>

        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">

          <Phone
            className="text-blue-600"
            size={24}
          />

          <h2 className="mt-4 font-semibold">
            Phone
          </h2>

          <p className="mt-2 text-slate-500">
            +91 1800-000-000
          </p>

        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">

          <MessageSquare
            className="text-blue-600"
            size={24}
          />

          <h2 className="mt-4 font-semibold">
            Working Hours
          </h2>

          <p className="mt-2 text-slate-500">
            Mon - Sat | 9:00 AM - 6:00 PM
          </p>

        </div>

      </div>

    </div>
  );
}

export default Support;