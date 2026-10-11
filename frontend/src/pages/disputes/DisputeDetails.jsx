import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  AlarmClock,
  ArrowLeft,
  Building2,
  CalendarClock,
  Check,
  Download,
  FileText,
  ImageIcon,
  MessageSquare,
  Paperclip,
  Send,
  Trash2,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";

import API, { errorMessage } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import Modal from "../../components/common/Modal";
import { PriorityBadge, StatusBadge } from "../../components/common/Badges";
import { ErrorState, PageLoader, Spinner } from "../../components/common/States";
import {
  ALLOWED_FILE_TYPES,
  DISPUTE_STAGES,
  DISPUTE_STATUSES,
  MAX_FILE_SIZE,
} from "../../lib/constants";
import {
  cn,
  formatCurrency,
  formatDate,
  formatFileSize,
  initials,
  isClosed,
  isOverdue,
  ROLE_LABELS,
  timeAgo,
} from "../../lib/utils";

const PROGRESS_STAGES = DISPUTE_STAGES.filter((s) => s !== "Rejected");

// ------------------------------------------------------------
// Small building blocks
// ------------------------------------------------------------

const Card = ({ title, icon: Icon, action, children, className }) => (
  <section className={cn("card", className)}>
    {title && (
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5">
        <h2 className="flex items-center gap-2 font-semibold text-slate-900">
          {Icon && <Icon className="h-4 w-4 text-slate-400" />}
          {title}
        </h2>
        {action}
      </div>
    )}
    <div className="p-5">{children}</div>
  </section>
);

const Detail = ({ label, children }) => (
  <div>
    <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</dt>
    <dd className="mt-1 break-words text-sm font-medium text-slate-800">{children || "—"}</dd>
  </div>
);

const StageProgress = ({ dispute }) => {
  const rejected = dispute.status === "Rejected";
  const current = PROGRESS_STAGES.indexOf(dispute.currentStage);

  return (
    <ol className="space-y-0">
      {PROGRESS_STAGES.map((stage, index) => {
        const done = !rejected && (index < current || dispute.status === "Resolved");
        const active = !rejected && index === current && dispute.status !== "Resolved";

        return (
          <li key={stage} className="relative flex gap-3 pb-5 last:pb-0">
            {index < PROGRESS_STAGES.length - 1 && (
              <span className={cn("absolute left-[11px] top-6 h-full w-0.5", done ? "bg-emerald-400" : "bg-slate-200")} />
            )}
            <span
              className={cn(
                "relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs",
                done && "border-emerald-500 bg-emerald-500 text-white",
                active && "border-blue-600 bg-white text-blue-600",
                !done && !active && "border-slate-200 bg-white text-slate-300"
              )}
            >
              {done ? <Check className="h-3.5 w-3.5" /> : index + 1}
            </span>
            <span className={cn("pt-0.5 text-sm", active ? "font-semibold text-blue-700" : done ? "text-slate-700" : "text-slate-400")}>
              {stage}
            </span>
          </li>
        );
      })}
      {rejected && (
        <li className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700">This dispute was rejected.</li>
      )}
    </ol>
  );
};

// ------------------------------------------------------------
// Page
// ------------------------------------------------------------

function DisputeDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [dispute, setDispute] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const res = await API.get(`/disputes/${id}`);
      setDispute(res.data.dispute);
      setPermissions(res.data.permissions);
    } catch (err) {
      setError(errorMessage(err, "Dispute not found."));
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (error) {
    return (
      <div className="space-y-4">
        <Link to="/dashboard/disputes" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" /> Back to disputes
        </Link>
        <ErrorState message={error} onRetry={load} />
      </div>
    );
  }

  if (!dispute) return <PageLoader label="Loading dispute…" />;

  const overdue = isOverdue(dispute);

  return (
    <div className="space-y-6">
      <Link to="/dashboard/disputes" className="no-print inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> Back to disputes
      </Link>

      {/* Header */}
      <div className="card p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900">{dispute.disputeId}</h1>
              <StatusBadge status={dispute.status} />
              <PriorityBadge priority={dispute.priority} />
              {overdue && (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">
                  <AlarmClock className="h-3.5 w-3.5" /> Past SLA
                </span>
              )}
            </div>
            <p className="mt-1.5 text-sm text-slate-500">
              {dispute.issueType} · Raised {formatDate(dispute.createdAt, true)} · Last updated {timeAgo(dispute.updatedAt)}
            </p>
          </div>
          <div className="flex items-center gap-4 lg:text-right">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Disputed amount</p>
              <p className="text-2xl font-bold tabular-nums text-slate-900">{formatCurrency(dispute.amount, dispute.currency)}</p>
            </div>
            {permissions.canDelete && <WithdrawButton dispute={dispute} isAdmin={user.role === "Admin"} onDone={() => navigate("/dashboard/disputes", { replace: true })} />}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-6 lg:col-span-2">
          <Card title="Dispute information" icon={FileText}>
            <dl className="grid grid-cols-2 gap-5 sm:grid-cols-3">
              <Detail label="Transaction ID">{dispute.transactionId}</Detail>
              <Detail label="Order ID">{dispute.orderId}</Detail>
              <Detail label="Transaction date">{dispute.transactionDate && formatDate(dispute.transactionDate)}</Detail>
              <Detail label="Issue type">{dispute.issueType}</Detail>
              <Detail label="Current stage">{dispute.currentStage}</Detail>
              <Detail label="SLA deadline">
                <span className={overdue ? "text-red-600" : ""}>{formatDate(dispute.slaDeadline)}</span>
              </Detail>
              {user.role !== "Customer" && (
                <Detail label="Customer">
                  {dispute.customer?.fullName}
                  <span className="block text-xs font-normal text-slate-500">{dispute.customer?.email}</span>
                </Detail>
              )}
              {dispute.resolvedAt && <Detail label="Resolved on">{formatDate(dispute.resolvedAt, true)}</Detail>}
            </dl>
            <div className="mt-6">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Description</p>
              <p className="mt-2 whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">{dispute.description}</p>
            </div>
          </Card>

          <EvidenceCard dispute={dispute} canAdd={permissions.canAddEvidence} onChange={load} />

          <CommentsCard dispute={dispute} currentUser={user} onChange={load} />

          <Card title="Activity timeline" icon={CalendarClock}>
            <ol className="relative space-y-6 border-l-2 border-slate-100 pl-6">
              {[...dispute.timeline].reverse().map((entry) => (
                <li key={entry._id} className="relative">
                  <span className="absolute -left-[31px] top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-blue-500 ring-2 ring-blue-100" />
                  <p className="text-sm font-medium text-slate-900">{entry.action}</p>
                  {entry.remarks && <p className="mt-1 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">{entry.remarks}</p>}
                  <p className="mt-1 text-xs text-slate-500">
                    {entry.performedByName || "System"} · {formatDate(entry.createdAt, true)}
                    {entry.stage && ` · ${entry.stage}`}
                  </p>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        {/* Side column */}
        <div className="space-y-6">
          {(permissions.canManage || permissions.canAssign) && (
            <ActionPanel dispute={dispute} permissions={permissions} isAdmin={user.role === "Admin"} onChange={load} />
          )}

          <Card title="Progress">
            <StageProgress dispute={dispute} />
          </Card>

          <Card title="Parties" icon={Building2}>
            <ul className="space-y-3 text-sm">
              {[
                ["Merchant", dispute.merchant],
                ["Bank", dispute.bank],
                ["Payment gateway", dispute.paymentGateway],
              ].map(([label, org]) => (
                <li key={label} className="flex items-center justify-between gap-3">
                  <span className="text-slate-500">{label}</span>
                  <span className="text-right font-medium text-slate-800">{org?.organizationName || "—"}</span>
                </li>
              ))}
              <li className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
                <span className="text-slate-500">Handled by</span>
                <span className="text-right font-medium text-slate-800">
                  {dispute.assignedEmployee?.fullName || <span className="text-amber-600">Awaiting assignment</span>}
                  {dispute.assignedOrganization?.organizationName && dispute.assignedEmployee && (
                    <span className="block text-xs font-normal text-slate-500">{dispute.assignedOrganization.organizationName}</span>
                  )}
                </span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// Withdraw / delete
// ------------------------------------------------------------

function WithdrawButton({ dispute, isAdmin, onDone }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const remove = async () => {
    setBusy(true);
    try {
      await API.delete(`/disputes/${dispute._id}`);
      toast.success(isAdmin ? "Dispute deleted" : "Dispute withdrawn");
      onDone();
    } catch (err) {
      toast.error(errorMessage(err));
      setBusy(false);
    }
  };

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-secondary no-print text-red-600 hover:bg-red-50">
        <Trash2 className="h-4 w-4" /> {isAdmin ? "Delete" : "Withdraw"}
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title={isAdmin ? "Delete this dispute?" : "Withdraw this dispute?"} size="sm">
        <p className="text-sm text-slate-600">
          {dispute.disputeId} and its evidence will be permanently removed. This can't be undone.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button className="btn-secondary" onClick={() => setOpen(false)} disabled={busy}>Cancel</button>
          <button className="btn-danger" onClick={remove} disabled={busy}>
            {busy && <Spinner className="h-4 w-4" />} {isAdmin ? "Delete" : "Withdraw"}
          </button>
        </div>
      </Modal>
    </>
  );
}

// ------------------------------------------------------------
// Evidence
// ------------------------------------------------------------

function EvidenceCard({ dispute, canAdd, onChange }) {
  const input = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [opening, setOpening] = useState(null);

  const openFile = async (file) => {
    setOpening(file._id);
    try {
      const res = await API.get(`/disputes/${dispute._id}/evidence/${file._id}`, { responseType: "blob" });

      if (res.headers["content-type"]?.includes("application/json")) {
        const { url } = JSON.parse(await res.data.text());
        window.open(url, "_blank", "noopener");
      } else {
        const url = URL.createObjectURL(res.data);
        window.open(url, "_blank", "noopener");
        setTimeout(() => URL.revokeObjectURL(url), 60000);
      }
    } catch {
      toast.error("Could not open the file.");
    } finally {
      setOpening(null);
    }
  };

  const upload = async (fileList) => {
    const files = Array.from(fileList);
    const bad = files.find((f) => !ALLOWED_FILE_TYPES.includes(f.type) || f.size > MAX_FILE_SIZE);

    if (bad) {
      toast.error(`${bad.name}: only JPG, PNG, WEBP or PDF up to 5 MB.`);
      return;
    }

    const payload = new FormData();
    files.slice(0, 5).forEach((f) => payload.append("evidence", f));

    setUploading(true);
    try {
      await API.post(`/disputes/${dispute._id}/evidence`, payload);
      toast.success("Evidence uploaded");
      onChange();
    } catch (err) {
      toast.error(errorMessage(err, "Upload failed."));
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card
      title={`Evidence (${dispute.evidence.length})`}
      icon={Paperclip}
      action={
        canAdd && (
          <>
            <button className="btn-secondary no-print h-8 px-3 text-xs" onClick={() => input.current?.click()} disabled={uploading}>
              {uploading ? <Spinner className="h-3.5 w-3.5" /> : <Paperclip className="h-3.5 w-3.5" />} Add files
            </button>
            <input ref={input} type="file" multiple hidden accept=".jpg,.jpeg,.png,.webp,.pdf" onChange={(e) => { upload(e.target.files); e.target.value = ""; }} />
          </>
        )
      }
    >
      {dispute.evidence.length === 0 ? (
        <p className="text-sm text-slate-500">No evidence attached yet.</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {dispute.evidence.map((file) => (
            <li key={file._id}>
              <button onClick={() => openFile(file)} className="flex w-full items-center gap-3 rounded-xl border border-slate-200 px-3 py-2.5 text-left transition hover:border-blue-300 hover:bg-blue-50/40">
                {file.mimeType === "application/pdf" ? <FileText className="h-5 w-5 shrink-0 text-red-500" /> : <ImageIcon className="h-5 w-5 shrink-0 text-blue-500" />}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800">{file.fileName}</p>
                  <p className="text-xs text-slate-500">{formatFileSize(file.size)} · {formatDate(file.uploadedAt)}</p>
                </div>
                {opening === file._id ? <Spinner className="h-4 w-4 text-slate-400" /> : <Download className="h-4 w-4 text-slate-400" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

// ------------------------------------------------------------
// Comments
// ------------------------------------------------------------

function CommentsCard({ dispute, currentUser, onChange }) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setSending(true);
    try {
      await API.post(`/disputes/${dispute._id}/comments`, { comment: text });
      setText("");
      onChange();
    } catch (err) {
      toast.error(errorMessage(err, "Could not post the comment."));
    } finally {
      setSending(false);
    }
  };

  return (
    <Card title="Conversation" icon={MessageSquare}>
      {dispute.comments.length === 0 ? (
        <p className="mb-4 text-sm text-slate-500">
          No messages yet. {currentUser.role === "Customer" ? "Ask a question or share more details with the team handling your dispute." : "Message the customer or other parties on this case."}
        </p>
      ) : (
        <ul className="mb-5 space-y-4">
          {dispute.comments.map((c) => {
            const mine = c.user === currentUser._id;
            return (
              <li key={c._id} className={cn("flex gap-3", mine && "flex-row-reverse")}>
                <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold", mine ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-700")}>
                  {initials(c.userName)}
                </div>
                <div className={cn("max-w-[80%]", mine && "text-right")}>
                  <p className="text-xs text-slate-500">
                    <span className="font-medium text-slate-700">{mine ? "You" : c.userName}</span> · {ROLE_LABELS[c.userRole] || c.userRole} · {timeAgo(c.createdAt)}
                  </p>
                  <p className={cn("mt-1 inline-block whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-left text-sm", mine ? "rounded-tr-sm bg-blue-600 text-white" : "rounded-tl-sm bg-slate-100 text-slate-800")}>
                    {c.comment}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <form onSubmit={send} className="no-print flex items-end gap-2">
        <textarea
          rows={2}
          maxLength={2000}
          className="input flex-1 resize-none"
          placeholder="Write a message…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) send(e);
          }}
          aria-label="Message"
        />
        <button type="submit" className="btn-primary h-11 w-11 px-0" disabled={sending || !text.trim()} aria-label="Send message">
          {sending ? <Spinner className="h-4 w-4" /> : <Send className="h-4 w-4" />}
        </button>
      </form>
    </Card>
  );
}

// ------------------------------------------------------------
// Staff actions: status, assignment, internal update
// ------------------------------------------------------------

function ActionPanel({ dispute, permissions, isAdmin, onChange }) {
  const closed = isClosed(dispute.status);
  const locked = closed && !isAdmin;

  const [status, setStatus] = useState(dispute.status);
  const [stage, setStage] = useState(dispute.currentStage);
  const [remarks, setRemarks] = useState("");
  const [saving, setSaving] = useState(false);

  const [employees, setEmployees] = useState(null);
  const [employeeId, setEmployeeId] = useState(dispute.assignedEmployee?._id || "");
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    setStatus(dispute.status);
    setStage(dispute.currentStage);
    setEmployeeId(dispute.assignedEmployee?._id || "");
  }, [dispute]);

  useEffect(() => {
    if (!permissions.canAssign || closed) return;
    API.get(`/disputes/${dispute._id}/assignable-employees`)
      .then((res) => setEmployees(res.data.employees))
      .catch(() => setEmployees([]));
  }, [dispute._id, permissions.canAssign, closed]);

  const needsRemarks = isClosed(status) && status !== dispute.status;

  const saveStatus = async (e) => {
    e.preventDefault();

    if (needsRemarks && !remarks.trim()) {
      toast.error("Please add remarks explaining the outcome.");
      return;
    }

    setSaving(true);
    try {
      await API.put(`/disputes/${dispute._id}/status`, {
        status,
        stage: isClosed(status) ? undefined : stage,
        remarks,
      });
      toast.success("Dispute updated");
      setRemarks("");
      onChange();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const addNote = async () => {
    if (!remarks.trim()) {
      toast.error("Write the update first.");
      return;
    }
    setSaving(true);
    try {
      await API.post(`/disputes/${dispute._id}/timeline`, { action: "Case update", remarks });
      toast.success("Update added to timeline");
      setRemarks("");
      onChange();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const assign = async () => {
    setAssigning(true);
    try {
      await API.put(`/disputes/${dispute._id}/assign`, { employeeId });
      toast.success("Dispute assigned");
      onChange();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setAssigning(false);
    }
  };

  const unchanged = status === dispute.status && stage === dispute.currentStage;

  return (
    <section className="card no-print overflow-hidden border-blue-200">
      <div className="border-b border-blue-100 bg-blue-50/60 px-5 py-3.5">
        <h2 className="font-semibold text-slate-900">Manage case</h2>
        <p className="text-xs text-slate-500">Visible to staff. Customers see status changes and remarks.</p>
      </div>

      <div className="space-y-6 p-5">
        {locked ? (
          <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
            This dispute is <strong>{dispute.status.toLowerCase()}</strong>. Only a platform admin can reopen it.
          </p>
        ) : (
          permissions.canManage && (
            <form onSubmit={saveStatus} className="space-y-3">
              <div>
                <label htmlFor="status" className="label">Status</label>
                <select id="status" className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
                  {DISPUTE_STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              {!isClosed(status) && (
                <div>
                  <label htmlFor="stage" className="label">Stage</label>
                  <select id="stage" className="input" value={stage} onChange={(e) => setStage(e.target.value)}>
                    {DISPUTE_STAGES.filter((s) => !isClosed(s)).map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label htmlFor="remarks" className="label">
                  Remarks {needsRemarks ? <span className="text-red-600">*</span> : <span className="font-normal text-slate-400">(shared with customer)</span>}
                </label>
                <textarea
                  id="remarks"
                  rows={3}
                  maxLength={1000}
                  className="input resize-none"
                  placeholder={needsRemarks ? "e.g. Refund of ₹2,499 processed, ref UTR 1234…" : "Optional note about this change"}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="btn-primary flex-1" disabled={saving || (unchanged && !remarks.trim())}>
                  {saving && <Spinner className="h-4 w-4" />} {unchanged ? "Save" : "Update status"}
                </button>
                {unchanged && (
                  <button type="button" className="btn-secondary" onClick={addNote} disabled={saving || !remarks.trim()} title="Add the remarks as a timeline update without changing status">
                    Add note
                  </button>
                )}
              </div>
            </form>
          )
        )}

        {permissions.canAssign && !closed && (
          <div className={cn(permissions.canManage && !locked && "border-t border-slate-100 pt-5")}>
            <label htmlFor="employee" className="label flex items-center gap-1.5">
              <UserCheck className="h-4 w-4 text-slate-400" /> Assign to
            </label>
            {employees === null ? (
              <div className="flex h-11 items-center"><Spinner className="h-4 w-4 text-slate-400" /></div>
            ) : employees.length === 0 ? (
              <p className="text-sm text-slate-500">No active staff available. Add employees from the Team page.</p>
            ) : (
              <div className="flex gap-2">
                <select id="employee" className="input" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}>
                  <option value="">Select employee</option>
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.fullName}{isAdmin && emp.organization ? ` — ${emp.organization.organizationName}` : ""}
                    </option>
                  ))}
                </select>
                <button className="btn-primary" onClick={assign} disabled={assigning || !employeeId || employeeId === dispute.assignedEmployee?._id}>
                  {assigning ? <Spinner className="h-4 w-4" /> : "Assign"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export default DisputeDetails;
