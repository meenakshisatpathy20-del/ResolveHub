import { useState } from "react";
import { ChevronDown, Clock, FilePlus2, Mail, MessageSquare, ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import PageHeader from "../../components/common/PageHeader";
import { cn } from "../../lib/utils";

const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL || "support@resolvehub.example";

const FAQS = [
  {
    q: "How do I raise a dispute?",
    a: "Go to Raise Dispute, enter the transaction ID and amount, select the merchant (and your bank or payment gateway if you know them), describe the problem and attach any screenshots or receipts. You'll get a dispute ID immediately.",
  },
  {
    q: "What happens after I submit?",
    a: "The merchant and any other organizations you selected are notified. Their team assigns the case to an employee, who reviews it and updates the status. Every update appears in the dispute's timeline and in your notifications.",
  },
  {
    q: "How long does resolution take?",
    a: "Each dispute gets a target date based on its priority: Critical 2 days, High 5 days, Medium 10 days, Low 15 days. The target is shown on the dispute page; cases past it are flagged to the organizations handling them.",
  },
  {
    q: "Can I add more evidence later?",
    a: "Yes. Open the dispute and use “Add files” in the Evidence section. You can attach JPG, PNG, WEBP or PDF files up to 5 MB each, as long as the dispute isn't closed.",
  },
  {
    q: "Can I withdraw a dispute?",
    a: "You can withdraw a dispute while it is still Open and hasn't been assigned to anyone. After that, message the team from the dispute's Conversation section instead.",
  },
  {
    q: "Someone made a payment from my account without permission. What should I do?",
    a: "Raise a dispute with the issue type “Unauthorized Transaction” and priority Critical. Also contact your bank immediately to block your card/UPI and report the fraud — you can report cyber fraud in India on the national helpline 1930 or at cybercrime.gov.in.",
  },
];

function Support() {
  const { user } = useAuth();
  const [open, setOpen] = useState(0);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader title="Help & Support" description="Answers to common questions, and how to reach us." />

      <div className="grid gap-4 md:grid-cols-3">
        {user.role === "Customer" && (
          <Link to="/dashboard/raise-dispute" className="card group p-5 transition hover:border-blue-300 hover:shadow-md">
            <FilePlus2 className="h-6 w-6 text-blue-600" />
            <p className="mt-3 font-semibold">Raise a dispute</p>
            <p className="mt-1 text-sm text-slate-500">Report a failed, duplicate or unrefunded payment.</p>
          </Link>
        )}
        <Link to="/dashboard/disputes" className="card p-5 transition hover:border-blue-300 hover:shadow-md">
          <MessageSquare className="h-6 w-6 text-violet-600" />
          <p className="mt-3 font-semibold">Message the case team</p>
          <p className="mt-1 text-sm text-slate-500">Open a dispute and use the Conversation section.</p>
        </Link>
        <a href={`mailto:${SUPPORT_EMAIL}`} className="card p-5 transition hover:border-blue-300 hover:shadow-md">
          <Mail className="h-6 w-6 text-emerald-600" />
          <p className="mt-3 font-semibold">Email support</p>
          <p className="mt-1 break-all text-sm text-slate-500">{SUPPORT_EMAIL}</p>
        </a>
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
        <p>
          ResolveHub staff will never ask for your OTP, PIN, CVV or full card number. For suspected fraud, contact your bank right away and call the national cyber crime helpline <strong>1930</strong>.
        </p>
      </div>

      <section className="card divide-y divide-slate-100">
        <h2 className="px-5 py-4 font-semibold">Frequently asked questions</h2>
        {FAQS.map((item, index) => (
          <div key={item.q}>
            <button
              onClick={() => setOpen(open === index ? -1 : index)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium text-slate-800 hover:bg-slate-50"
              aria-expanded={open === index}
            >
              {item.q}
              <ChevronDown className={cn("h-4 w-4 shrink-0 text-slate-400 transition", open === index && "rotate-180")} />
            </button>
            {open === index && <p className="px-5 pb-4 text-sm leading-relaxed text-slate-600">{item.a}</p>}
          </div>
        ))}
      </section>

      <p className="flex items-center justify-center gap-2 text-xs text-slate-400">
        <Clock className="h-3.5 w-3.5" /> Email support replies within 1–2 business days.
      </p>
    </div>
  );
}

export default Support;
