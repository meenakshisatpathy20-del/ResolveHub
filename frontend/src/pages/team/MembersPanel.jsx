import { useCallback, useEffect, useState } from "react";
import { UserPlus, Users } from "lucide-react";
import { toast } from "sonner";

import API, { errorMessage } from "../../services/api";
import Modal from "../../components/common/Modal";
import PasswordInput from "../../components/common/PasswordInput";
import { Badge } from "../../components/common/Badges";
import { EmptyState, ErrorState, Spinner } from "../../components/common/States";
import { cn, formatDate, initials, ROLE_LABELS } from "../../lib/utils";

const EMPTY = { fullName: "", email: "", phoneNumber: "", password: "", role: "Employee" };

// Members of one organization, with add / activate / deactivate.
// Used by the Admin organizations page and the OrganizationAdmin team page.
function MembersPanel({ organizationId, canAddAdmins, currentUserId }) {
  const [members, setMembers] = useState(null);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setError("");
    try {
      const res = await API.get(`/organizations/${organizationId}/members`);
      setMembers(res.data.members);
    } catch (err) {
      setError(errorMessage(err));
    }
  }, [organizationId]);

  useEffect(() => {
    load();
  }, [load]);

  const add = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.post(`/organizations/${organizationId}/members`, form);
      toast.success(`${form.fullName} added. Share the temporary password with them securely.`);
      setOpen(false);
      setForm(EMPTY);
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (member) => {
    const next = member.accountStatus === "Active" ? "Inactive" : "Active";
    setBusyId(member._id);
    try {
      await API.put(`/organizations/${organizationId}/members/${member._id}/status`, { accountStatus: next });
      toast.success(`${member.fullName} ${next === "Active" ? "activated" : "deactivated"}`);
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-slate-500">{members ? `${members.length} member${members.length === 1 ? "" : "s"}` : ""}</p>
        <button className="btn-primary" onClick={() => setOpen(true)}>
          <UserPlus className="h-4 w-4" /> Add member
        </button>
      </div>

      {!members ? (
        <div className="flex justify-center py-10"><Spinner className="h-6 w-6 text-blue-600" /></div>
      ) : members.length === 0 ? (
        <EmptyState icon={Users} title="No members yet" description="Add employees so disputes can be assigned to them." />
      ) : (
        <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
          {members.map((m) => (
            <li key={m._id} className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold", m.accountStatus === "Active" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-400")}>
                  {initials(m.fullName)}
                </div>
                <div className="min-w-0">
                  <p className={cn("truncate text-sm font-semibold", m.accountStatus !== "Active" && "text-slate-400")}>
                    {m.fullName} {m._id === currentUserId && <span className="font-normal text-slate-400">(you)</span>}
                  </p>
                  <p className="truncate text-xs text-slate-500">{m.email} · last login {m.lastLogin ? formatDate(m.lastLogin) : "never"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 pl-12 sm:pl-0">
                <Badge className={m.role === "OrganizationAdmin" ? "bg-violet-50 text-violet-700 ring-violet-600/20" : ""}>{ROLE_LABELS[m.role]}</Badge>
                <Badge>{m.activeCases} active case{m.activeCases === 1 ? "" : "s"}</Badge>
                {m.accountStatus !== "Active" && <Badge className="bg-red-50 text-red-700 ring-red-600/20">Inactive</Badge>}
                {m._id !== currentUserId && (canAddAdmins || m.role === "Employee") && (
                  <button className="btn-ghost h-8 px-2.5 text-xs" onClick={() => toggle(m)} disabled={busyId === m._id}>
                    {busyId === m._id ? <Spinner className="h-3.5 w-3.5" /> : m.accountStatus === "Active" ? "Deactivate" : "Activate"}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Add a member" description="They can log in immediately with the temporary password.">
        <form onSubmit={add} className="space-y-4">
          <div>
            <label className="label" htmlFor="m-name">Full name *</label>
            <input id="m-name" className="input" required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
          </div>
          <div>
            <label className="label" htmlFor="m-email">Work email *</label>
            <input id="m-email" type="email" className="input" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="label" htmlFor="m-phone">Phone</label>
            <input id="m-phone" type="tel" className="input" value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} />
          </div>
          {canAddAdmins && (
            <div>
              <label className="label" htmlFor="m-role">Role</label>
              <select id="m-role" className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="Employee">Employee — handles assigned cases</option>
                <option value="OrganizationAdmin">Organization Admin — sees all cases, manages team</option>
              </select>
            </div>
          )}
          <div>
            <label className="label" htmlFor="m-pass">Temporary password *</label>
            <PasswordInput id="m-pass" required minLength={8} placeholder="Min. 8 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <p className="mt-1.5 text-xs text-slate-500">Ask them to change it from Settings after their first login.</p>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving && <Spinner className="h-4 w-4" />} Add member
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default MembersPanel;
