import { useState } from "react";
import { KeyRound, ShieldCheck, UserRound } from "lucide-react";
import { toast } from "sonner";

import API, { errorMessage } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import PageHeader from "../../components/common/PageHeader";
import PasswordInput from "../../components/common/PasswordInput";
import { Spinner } from "../../components/common/States";
import { formatDate, initials, ROLE_LABELS } from "../../lib/utils";

function Settings() {
  const { user, updateUser } = useAuth();

  const [profile, setProfile] = useState({ fullName: user.fullName, phoneNumber: user.phoneNumber || "" });
  const [savingProfile, setSavingProfile] = useState(false);

  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [savingPassword, setSavingPassword] = useState(false);

  const saveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await API.put("/auth/profile", profile);
      updateUser(res.data.user);
      toast.success("Profile updated");
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword.length < 8) return toast.error("New password must be at least 8 characters.");
    if (passwords.newPassword !== passwords.confirm) return toast.error("New passwords do not match.");

    setSavingPassword(true);
    try {
      await API.put("/auth/change-password", {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      setPasswords({ currentPassword: "", newPassword: "", confirm: "" });
      toast.success("Password changed");
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSavingPassword(false);
    }
  };

  const profileChanged = profile.fullName !== user.fullName || profile.phoneNumber !== (user.phoneNumber || "");

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title="Settings" description="Manage your profile and account security." />

      {/* Account summary */}
      <div className="card flex flex-col items-center gap-4 p-6 text-center sm:flex-row sm:text-left">
        {user.profileImage ? (
          <img src={user.profileImage} alt="" className="h-16 w-16 rounded-full object-cover" referrerPolicy="no-referrer" />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-xl font-bold text-white">{initials(user.fullName)}</div>
        )}
        <div className="flex-1">
          <p className="text-lg font-semibold">{user.fullName}</p>
          <p className="text-sm text-slate-500">{user.email}</p>
          <p className="mt-1 text-xs text-slate-400">
            {ROLE_LABELS[user.role]}
            {user.organization?.organizationName && ` · ${user.organization.organizationName}`}
            {user.createdAt && ` · Member since ${formatDate(user.createdAt)}`}
          </p>
        </div>
        {user.emailVerified && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
            <ShieldCheck className="h-3.5 w-3.5" /> Email verified
          </span>
        )}
      </div>

      <form onSubmit={saveProfile} className="card p-6">
        <h2 className="mb-5 flex items-center gap-2 font-semibold"><UserRound className="h-4 w-4 text-slate-400" /> Profile</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="s-name">Full name</label>
            <input id="s-name" className="input" required value={profile.fullName} onChange={(e) => setProfile({ ...profile, fullName: e.target.value })} />
          </div>
          <div>
            <label className="label" htmlFor="s-phone">Phone number</label>
            <input id="s-phone" type="tel" className="input" value={profile.phoneNumber} onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="s-email">Email</label>
            <input id="s-email" className="input" value={user.email} disabled />
            <p className="mt-1.5 text-xs text-slate-500">Email can't be changed because it's used to sign in.</p>
          </div>
        </div>
        <div className="mt-5 flex justify-end">
          <button type="submit" className="btn-primary" disabled={savingProfile || !profileChanged}>
            {savingProfile && <Spinner className="h-4 w-4" />} Save changes
          </button>
        </div>
      </form>

      <form onSubmit={changePassword} className="card p-6">
        <h2 className="mb-5 flex items-center gap-2 font-semibold"><KeyRound className="h-4 w-4 text-slate-400" /> Change password</h2>
        <div className="space-y-4">
          <div>
            <label className="label" htmlFor="s-current">Current password</label>
            <PasswordInput id="s-current" autoComplete="current-password" required value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} />
            <p className="mt-1.5 text-xs text-slate-500">Signed up with Google? Use “Forgot password” on the login page to set one.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="s-new">New password</label>
              <PasswordInput id="s-new" autoComplete="new-password" required placeholder="Min. 8 characters" value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} />
            </div>
            <div>
              <label className="label" htmlFor="s-confirm">Confirm new password</label>
              <PasswordInput id="s-confirm" autoComplete="new-password" required value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} />
            </div>
          </div>
        </div>
        <div className="mt-5 flex justify-end">
          <button type="submit" className="btn-primary" disabled={savingPassword || !passwords.currentPassword || !passwords.newPassword}>
            {savingPassword && <Spinner className="h-4 w-4" />} Update password
          </button>
        </div>
      </form>
    </div>
  );
}

export default Settings;
