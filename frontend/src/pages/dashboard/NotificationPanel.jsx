import {
  Bell,
} from "lucide-react";

function NotificationPanel() {

  const notifications = [];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white">

      <div className="border-b border-slate-200 p-6">

        <h2 className="text-lg font-semibold">
          Notifications
        </h2>

      </div>

      {notifications.length === 0 ? (

        <div className="flex flex-col items-center justify-center py-20">

          <Bell
            size={42}
            className="mb-4 text-slate-300"
          />

          <h3 className="font-semibold">
            No Notifications
          </h3>

          <p className="mt-2 text-center text-sm text-slate-500">

            You'll receive updates about
            dispute activities here.

          </p>

        </div>

      ) : (

        <div>

          {notifications.map((notification) => (

            <div
              key={notification._id}
              className="border-b border-slate-100 p-5"
            >

              <h3 className="font-medium">

                {notification.title}

              </h3>

              <p className="mt-2 text-sm text-slate-500">

                {notification.message}

              </p>

            </div>

          ))}

        </div>

      )}

    </div>
  );
}

export default NotificationPanel;