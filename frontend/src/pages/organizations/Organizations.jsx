import { useCallback, useEffect, useState } from "react";
import { Building2, Mail, Pencil, Phone, Plus, Search, Trash2, Users } from "lucide-react";
import { toast } from "sonner";

import API, { errorMessage } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import PageHeader from "../../components/common/PageHeader";
import Modal from "../../components/common/Modal";
import { Badge } from "../../components/common/Badges";
import { EmptyState, ErrorState, PageLoader, Spinner } from "../../components/common/States";
import MembersPanel from "../team/MembersPanel";
import { ORGANIZATION_TYPES } from "../../lib/constants";
import { cn } from "../../lib/utils";

const EMPTY = { organizationName: "", organizationType: "", email: "", phone: "", address: "" };

const TYPE_COLORS = {
  Bank: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  Merchant: "bg-blue-50 text-blue-700 ring-blue-600/20",
  "E-commerce Platform": "bg-indigo-50 text-indigo-700 ring-indigo-600/20",
  "Payment Gateway": "bg-violet-50 text-violet-700 ring-violet-600/20",
  "Logistics Partner": "bg-amber-50 text-amber-700 ring-amber-600/20",
};

function Organizations() {
  const { user } = useAuth();
  const [orgs, setOrgs] = useState(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const [editing, setEditing] = useState(null); // null | "new" | org
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [membersOf, setMembersOf] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    setError("");
    try {
      const res = await API.get("/organizations");
      setOrgs(res.data.organizations);
    } catch (err) {
      setError(errorMessage(err));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openEditor = (org) => {
    setEditing(org || "new");
    setForm(org ? { organizationName: org.organizationName, organizationType: org.organizationType, email: org.email, phone: org.phone || "", address: org.address || "" } : EMPTY);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing === "new") {
        await API.post("/organizations", form);
        toast.success("Organization created");
      } else {
        await API.put(`/organizations/${editing._id}`, form);
        toast.success("Organization updated");
      }
      setEditing(null);
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (org) => {
    try {
      await API.put(`/organizations/${org._id}`, { isActive: !org.isActive });
      toast.success(`${org.organizationName} ${org.isActive ? "deactivated" : "activated"}`);
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const remove = async () => {
    try {
      await API.delete(`/organizations/${deleting._id}`);
      toast.success("Organization deleted");
      setDeleting(null);
      load();
    } catch (err) {
      toast.error(errorMessage(err));
      setDeleting(null);
    }
  };

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!orgs) return <PageLoader />;

  const visible = orgs.filter(
    (o) =>
      (!typeFilter || o.organizationType === typeFilter) &&
      o.organizationName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="Organizations"
        description="Merchants, banks and payment gateways that participate in dispute resolution."
        actions={
          <button className="btn-primary" onClick={() => openEditor(null)}>
            <Plus className="h-4 w-4" /> Add organization
          </button>
        }
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
          <input className="input pl-10" placeholder="Search organizations" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search organizations" />
        </div>
        <select className="input sm:w-56" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} aria-label="Filter by type">
          <option value="">All types</option>
          {ORGANIZATION_TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
      </div>

      {visible.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Building2}
            title={orgs.length ? "No matching organizations" : "No organizations yet"}
            description={orgs.length ? "Try a different search." : "Add the merchants, banks and gateways customers can raise disputes against."}
          />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((org) => (
            <div key={org._id} className={cn("card flex flex-col p-5", !org.isActive && "opacity-70")}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold text-slate-900">{org.organizationName}</h3>
                    <Badge className={TYPE_COLORS[org.organizationType]}>{org.organizationType}</Badge>
                  </div>
                </div>
                {!org.isActive && <Badge className="bg-red-50 text-red-700 ring-red-600/20">Inactive</Badge>}
              </div>

              <div className="mt-4 space-y-1.5 text-sm text-slate-600">
                <p className="flex items-center gap-2 truncate"><Mail className="h-4 w-4 shrink-0 text-slate-400" /> {org.email}</p>
                {org.phone && <p className="flex items-center gap-2"><Phone className="h-4 w-4 shrink-0 text-slate-400" /> {org.phone}</p>}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3 text-center">
                <div>
                  <p className="text-lg font-bold">{org.memberCount}</p>
                  <p className="text-xs text-slate-500">Members</p>
                </div>
                <div>
                  <p className="text-lg font-bold">{org.disputeCount}</p>
                  <p className="text-xs text-slate-500">Disputes</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                <button className="btn-secondary h-9 flex-1 px-3" onClick={() => setMembersOf(org)}>
                  <Users className="h-4 w-4" /> Members
                </button>
                <button className="btn-ghost h-9 px-3" onClick={() => openEditor(org)} aria-label={`Edit ${org.organizationName}`}>
                  <Pencil className="h-4 w-4" />
                </button>
                <button className="btn-ghost h-9 px-3 text-xs" onClick={() => toggleActive(org)}>
                  {org.isActive ? "Deactivate" : "Activate"}
                </button>
                {org.disputeCount === 0 && (
                  <button className="btn-ghost h-9 px-3 text-red-600 hover:bg-red-50" onClick={() => setDeleting(org)} aria-label={`Delete ${org.organizationName}`}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / edit */}
      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title={editing === "new" ? "Add organization" : "Edit organization"}>
        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="label" htmlFor="o-name">Organization name *</label>
            <input id="o-name" className="input" required value={form.organizationName} onChange={(e) => setForm({ ...form, organizationName: e.target.value })} />
          </div>
          <div>
            <label className="label" htmlFor="o-type">Type *</label>
            <select id="o-type" className="input" required value={form.organizationType} onChange={(e) => setForm({ ...form, organizationType: e.target.value })}>
              <option value="">Select type</option>
              {ORGANIZATION_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="o-email">Contact email *</label>
              <input id="o-email" type="email" className="input" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="label" htmlFor="o-phone">Phone</label>
              <input id="o-phone" type="tel" className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="o-address">Address</label>
            <textarea id="o-address" rows={2} className="input resize-none" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setEditing(null)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving && <Spinner className="h-4 w-4" />} {editing === "new" ? "Create" : "Save changes"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Members */}
      <Modal open={Boolean(membersOf)} onClose={() => { setMembersOf(null); load(); }} title={membersOf?.organizationName || ""} description="Organization admins see all of the organization's cases; employees see cases assigned to them." size="lg">
        {membersOf && <MembersPanel organizationId={membersOf._id} canAddAdmins currentUserId={user._id} />}
      </Modal>

      {/* Delete */}
      <Modal open={Boolean(deleting)} onClose={() => setDeleting(null)} title="Delete organization?" size="sm">
        <p className="text-sm text-slate-600">
          {deleting?.organizationName} will be removed and its members deactivated. This can't be undone.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button className="btn-secondary" onClick={() => setDeleting(null)}>Cancel</button>
          <button className="btn-danger" onClick={remove}>Delete</button>
        </div>
      </Modal>
    </div>
  );
}

export default Organizations;
