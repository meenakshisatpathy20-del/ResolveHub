import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, ImageIcon, Info, UploadCloud, X } from "lucide-react";
import { toast } from "sonner";

import API, { errorMessage } from "../../services/api";
import PageHeader from "../../components/common/PageHeader";
import { ErrorState, PageLoader, Spinner } from "../../components/common/States";
import {
  ALLOWED_FILE_TYPES,
  ISSUE_TYPES,
  MAX_FILE_SIZE,
  PRIORITIES,
} from "../../lib/constants";
import { cn, formatFileSize } from "../../lib/utils";

const MAX_FILES = 5;

const PRIORITY_HELP = {
  Low: "Small amount, no urgency — target resolution in 15 days",
  Medium: "Standard — target resolution in 10 days",
  High: "Significant amount or time-sensitive — target 5 days",
  Critical: "Unauthorized/fraudulent transaction — target 2 days",
};

const EMPTY_FORM = {
  transactionId: "",
  orderId: "",
  transactionDate: "",
  amount: "",
  merchant: "",
  bank: "",
  paymentGateway: "",
  issueType: "",
  priority: "Medium",
  description: "",
};

const FieldError = ({ error }) =>
  error ? <p className="mt-1.5 text-xs text-red-600">{error}</p> : null;

const Section = ({ step, title, description, children }) => (
  <section className="card p-5 sm:p-6">
    <div className="mb-5 flex items-start gap-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
        {step}
      </span>
      <div>
        <h2 className="font-semibold text-slate-900">{title}</h2>
        {description && <p className="text-sm text-slate-500">{description}</p>}
      </div>
    </div>
    {children}
  </section>
);

function RaiseDispute() {
  const navigate = useNavigate();
  const fileInput = useRef(null);

  const [organizations, setOrganizations] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [dragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadOrganizations = () => {
    setLoadError("");
    API.get("/organizations")
      .then((res) => setOrganizations(res.data.organizations))
      .catch((err) => setLoadError(errorMessage(err)));
  };

  useEffect(() => {
    loadOrganizations();
  }, []);

  const orgsByType = useMemo(() => {
    const list = organizations || [];
    return {
      merchant: list.filter((o) => ["Merchant", "E-commerce Platform"].includes(o.organizationType)),
      bank: list.filter((o) => o.organizationType === "Bank"),
      gateway: list.filter((o) => o.organizationType === "Payment Gateway"),
    };
  }, [organizations]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const addFiles = (incoming) => {
    const accepted = [];
    const rejected = [];

    Array.from(incoming).forEach((file) => {
      if (!ALLOWED_FILE_TYPES.includes(file.type)) rejected.push(`${file.name}: unsupported type`);
      else if (file.size > MAX_FILE_SIZE) rejected.push(`${file.name}: larger than 5 MB`);
      else accepted.push(file);
    });

    const room = MAX_FILES - files.length;
    if (accepted.length > room) rejected.push(`Only ${MAX_FILES} files allowed`);

    if (rejected.length) toast.error(rejected.join("\n"));
    setFiles((prev) => [...prev, ...accepted.slice(0, Math.max(0, room))]);
  };

  const validate = () => {
    const next = {};
    if (!form.transactionId.trim()) next.transactionId = "Transaction ID is required.";
    if (!form.amount || Number(form.amount) <= 0) next.amount = "Enter the disputed amount.";
    if (form.transactionDate && new Date(form.transactionDate) > new Date())
      next.transactionDate = "Date can't be in the future.";
    if (!form.merchant) next.merchant = "Select the merchant you paid.";
    if (!form.issueType) next.issueType = "Select what went wrong.";
    if (form.description.trim().length < 20)
      next.description = "Please describe the issue in at least 20 characters.";

    setErrors(next);

    if (Object.keys(next).length) {
      toast.error("Please fix the highlighted fields.");
      document.querySelector(`[name="${Object.keys(next)[0]}"]`)?.focus();
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => value && payload.append(key, value));
    files.forEach((file) => payload.append("evidence", file));

    setSubmitting(true);
    try {
      const res = await API.post("/disputes", payload);
      toast.success(`Dispute ${res.data.dispute.disputeId} submitted`);
      navigate(`/dashboard/disputes/${res.data.dispute._id}`, { replace: true });
    } catch (err) {
      toast.error(errorMessage(err, "Could not submit the dispute."));
    } finally {
      setSubmitting(false);
    }
  };

  if (loadError) return <ErrorState message={loadError} onRetry={loadOrganizations} />;
  if (!organizations) return <PageLoader />;

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Raise a dispute"
        description="Tell us what went wrong with your payment. We'll route it to the merchant, bank and payment gateway involved."
      />

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <Section step="1" title="Transaction details" description="Find these in your bank SMS, UPI app or order confirmation.">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="transactionId" className="label">Transaction / UTR ID *</label>
              <input id="transactionId" name="transactionId" className={cn("input", errors.transactionId && "border-red-400")} placeholder="e.g. 412345678901" value={form.transactionId} onChange={handleChange} />
              <FieldError error={errors.transactionId} />
            </div>
            <div>
              <label htmlFor="orderId" className="label">Order ID <span className="font-normal text-slate-400">(optional)</span></label>
              <input id="orderId" name="orderId" className="input" placeholder="e.g. OD12345" value={form.orderId} onChange={handleChange} />
            </div>
            <div>
              <label htmlFor="amount" className="label">Disputed amount (₹) *</label>
              <input id="amount" name="amount" type="number" min="1" step="0.01" inputMode="decimal" className={cn("input", errors.amount && "border-red-400")} placeholder="0.00" value={form.amount} onChange={handleChange} />
              <FieldError error={errors.amount} />
            </div>
            <div>
              <label htmlFor="transactionDate" className="label">Transaction date</label>
              <input id="transactionDate" name="transactionDate" type="date" max={today} className={cn("input", errors.transactionDate && "border-red-400")} value={form.transactionDate} onChange={handleChange} />
              <FieldError error={errors.transactionDate} />
            </div>
          </div>
        </Section>

        <Section step="2" title="Organizations involved" description="Only the merchant is required. Add the bank and gateway if you know them.">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="merchant" className="label">Merchant *</label>
              <select id="merchant" name="merchant" className={cn("input", errors.merchant && "border-red-400")} value={form.merchant} onChange={handleChange}>
                <option value="">Select merchant</option>
                {orgsByType.merchant.map((o) => <option key={o._id} value={o._id}>{o.organizationName}</option>)}
              </select>
              <FieldError error={errors.merchant} />
            </div>
            <div>
              <label htmlFor="bank" className="label">Your bank</label>
              <select id="bank" name="bank" className="input" value={form.bank} onChange={handleChange}>
                <option value="">Not sure / skip</option>
                {orgsByType.bank.map((o) => <option key={o._id} value={o._id}>{o.organizationName}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="paymentGateway" className="label">Payment gateway</label>
              <select id="paymentGateway" name="paymentGateway" className="input" value={form.paymentGateway} onChange={handleChange}>
                <option value="">Not sure / skip</option>
                {orgsByType.gateway.map((o) => <option key={o._id} value={o._id}>{o.organizationName}</option>)}
              </select>
            </div>
          </div>
          {orgsByType.merchant.length === 0 && (
            <p className="mt-3 flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800">
              <Info className="h-4 w-4 shrink-0" /> No merchants are registered yet. Please contact support.
            </p>
          )}
        </Section>

        <Section step="3" title="What went wrong?">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="issueType" className="label">Issue type *</label>
              <select id="issueType" name="issueType" className={cn("input", errors.issueType && "border-red-400")} value={form.issueType} onChange={handleChange}>
                <option value="">Select issue</option>
                {ISSUE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <FieldError error={errors.issueType} />
            </div>
            <div>
              <label htmlFor="priority" className="label">Priority</label>
              <select id="priority" name="priority" className="input" value={form.priority} onChange={handleChange}>
                {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
              <p className="mt-1.5 text-xs text-slate-500">{PRIORITY_HELP[form.priority]}</p>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="description" className="label">Description *</label>
              <textarea
                id="description"
                name="description"
                rows={5}
                maxLength={3000}
                className={cn("input resize-y", errors.description && "border-red-400")}
                placeholder="What happened, when, and what outcome you expect (e.g. refund of ₹2,499 to my original payment method)."
                value={form.description}
                onChange={handleChange}
              />
              <div className="flex justify-between">
                <FieldError error={errors.description} />
                <span className="ml-auto mt-1.5 text-xs text-slate-400">{form.description.length}/3000</span>
              </div>
            </div>
          </div>
        </Section>

        <Section step="4" title="Evidence" description="Screenshots, receipts or bank statements help resolve disputes faster.">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
            onClick={() => fileInput.current?.click()}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && fileInput.current?.click()}
            role="button"
            tabIndex={0}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition",
              dragging ? "border-blue-500 bg-blue-50" : "border-slate-300 hover:border-blue-400 hover:bg-slate-50"
            )}
          >
            <UploadCloud className="h-10 w-10 text-blue-500" />
            <p className="mt-3 font-medium text-slate-800">Drop files here or click to browse</p>
            <p className="mt-1 text-xs text-slate-500">JPG, PNG, WEBP or PDF · up to 5 MB each · max {MAX_FILES} files</p>
            <input
              ref={fileInput}
              type="file"
              multiple
              accept=".jpg,.jpeg,.png,.webp,.pdf"
              className="hidden"
              onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }}
            />
          </div>

          {files.length > 0 && (
            <ul className="mt-4 space-y-2">
              {files.map((file, index) => (
                <li key={`${file.name}-${index}`} className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2.5">
                  {file.type === "application/pdf" ? <FileText className="h-5 w-5 text-red-500" /> : <ImageIcon className="h-5 w-5 text-blue-500" />}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
                  </div>
                  <button type="button" onClick={() => setFiles((prev) => prev.filter((_, i) => i !== index))} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-red-600" aria-label={`Remove ${file.name}`}>
                    <X className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <div className="flex flex-col-reverse gap-3 pb-6 sm:flex-row sm:justify-end">
          <button type="button" className="btn-secondary h-11" onClick={() => navigate(-1)} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" className="btn-primary h-11 px-6" disabled={submitting}>
            {submitting && <Spinner className="h-4 w-4" />}
            {submitting ? "Submitting…" : "Submit dispute"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default RaiseDispute;
