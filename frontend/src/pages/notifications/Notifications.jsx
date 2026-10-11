import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, BellOff, CheckCheck, MessageSquare, Trash2, UserCheck, Building2, FileText } from "lucide-react";
import { toast } from "sonner";

import API, { errorMessage } from "../../services/api";
import PageHeader from "../../components/common/PageHeader";
import { EmptyState, ErrorState, PageLoader } from "../../components/common/States";
import { NOTIFICATIONS_CHANGED } from "../../lib/constants";
import { cn, timeAgo } from "../../lib/utils";

const ICONS = {
  Dispute: FileText,
  Assignment: UserCheck,
  Comment: MessageSquare,
  Organization: Building2,
  System: Bell,
};

const notifyBadge = () => window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED));

function Notifications() {
  const navigate = useNavigate();
  const [items, setItems] = useState(null);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const res = await API.get("/notifications");
      setItems(res.data.notifications);
    } catch (err) {
      setError(errorMessage(err));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const markRead = async (n) => {
    if (n.isRead) return;
    setItems((prev) => prev.map((x) => (x._id === n._id ? { ...x, isRead: true } : x)));
    await API.put(`/notifications/${n._id}/read`).catch(() => {});
    notifyBadge();
  };

  const open = (n) => {
    markRead(n);
    if (n.dispute?._id) navigate(`/dashboard/disputes/${n.dispute._id}`);
  };

  const markAll = async () => {
    try {
      await API.put("/notifications/read-all");
      setItems((prev) => prev.map((x) => ({ ...x, isRead: true })));
      notifyBadge();
      toast.success("All notifications marked as read");
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const remove = async (n) => {
    try {
      await API.delete(`/notifications/${n._id}`);
      setItems((prev) => prev.filter((x) => x._id !== n._id));
      notifyBadge();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!items) return <PageLoader />;

  const unread = items.filter((n) => !n.isRead).length;
  const visible = filter === "unread" ? items.filter((n) => !n.isRead) : items;

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Notifications"
        description={unread ? `You have ${unread} unread notification${unread === 1 ? "" : "s"}.` : "You're all caught up."}
        actions={
          unread > 0 && (
            <button className="btn-secondary" onClick={markAll}>
              <CheckCheck className="h-4 w-4" /> Mark all as read
            </button>
          )
        }
      />

      <div className="mb-4 inline-flex rounded-xl bg-slate-100 p-1 text-sm">
        {["all", "unread"].map((key) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={cn("rounded-lg px-4 py-1.5 font-medium capitalize transition", filter === key ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}
          >
            {key} {key === "unread" && unread > 0 && `(${unread})`}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        {visible.length === 0 ? (
          <EmptyState icon={BellOff} title={filter === "unread" ? "No unread notifications" : "No notifications yet"} description="Updates about your disputes will appear here." />
        ) : (
          <ul className="divide-y divide-slate-100">
            {visible.map((n) => {
              const Icon = ICONS[n.type] || Bell;
              return (
                <li key={n._id} className={cn("group flex items-start gap-4 px-5 py-4 transition hover:bg-slate-50", !n.isRead && "bg-blue-50/40")}>
                  <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", n.isRead ? "bg-slate-100 text-slate-500" : "bg-blue-100 text-blue-600")}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <button className="min-w-0 flex-1 text-left" onClick={() => open(n)}>
                    <div className="flex items-center gap-2">
                      <p className={cn("text-sm", n.isRead ? "font-medium text-slate-700" : "font-semibold text-slate-900")}>{n.title}</p>
                      {!n.isRead && <span className="h-2 w-2 rounded-full bg-blue-600" aria-label="Unread" />}
                    </div>
                    <p className="mt-0.5 text-sm text-slate-600">{n.message}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {timeAgo(n.createdAt)}
                      {n.dispute?.disputeId && ` · ${n.dispute.disputeId}`}
                    </p>
                  </button>
                  <button
                    onClick={() => remove(n)}
                    className="rounded-lg p-2 text-slate-300 opacity-100 transition hover:bg-red-50 hover:text-red-600 sm:opacity-0 sm:group-hover:opacity-100"
                    aria-label="Delete notification"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Notifications;
