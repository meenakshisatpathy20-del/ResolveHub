import {
  Bell,
  CheckCircle,
  AlertCircle,
  Clock3,
} from "lucide-react";

function Notifications() {
  const notifications = [
    {
      title: "Dispute moved to Bank Verification",
      time: "2 mins ago",
      icon: AlertCircle,
      color: "text-yellow-600",
    },
    {
      title: "Evidence uploaded successfully",
      time: "1 hour ago",
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      title: "Merchant responded",
      time: "Yesterday",
      icon: Clock3,
      color: "text-blue-600",
    },
  ];

  return (
    <div className="space-y-6">

      <div>

        <h1 className="text-3xl font-semibold">
          Notifications
        </h1>

        <p className="mt-2 text-slate-500">
          Stay updated with dispute activities.
        </p>

      </div>

      <div className="rounded-2xl border border-slate-200 bg-white">

        {notifications.map((item, index) => {
          const Icon = item.icon;

          return (
            <div
              key={index}
              className="flex items-center justify-between border-b px-6 py-5 last:border-0 hover:bg-slate-50"
            >
              <div className="flex items-center gap-4">

                <div className="rounded-xl bg-slate-100 p-3">

                  <Icon
                    size={20}
                    className={item.color}
                  />

                </div>

                <div>

                  <h3 className="font-medium">
                    {item.title}
                  </h3>

                  <p className="text-sm text-slate-500">
                    {item.time}
                  </p>

                </div>

              </div>

              <Bell
                size={18}
                className="text-slate-400"
              />

            </div>
          );
        })}

      </div>

    </div>
  );
}

export default Notifications;