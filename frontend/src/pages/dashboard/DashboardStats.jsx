import {
  FolderKanban,
  Clock3,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

const cards = [
  {
    title: "Open Cases",
    value: "--",
    icon: FolderKanban,
  },
  {
    title: "Awaiting Response",
    value: "--",
    icon: Clock3,
  },
  {
    title: "High Priority",
    value: "--",
    icon: AlertTriangle,
  },
  {
    title: "Resolved Today",
    value: "--",
    icon: CheckCircle2,
  },
];

function DashboardStats() {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className="rounded-2xl border border-slate-200 bg-white p-6"
          >

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-slate-500">
                  {card.title}
                </p>

                <h2 className="mt-3 text-3xl font-bold">
                  {card.value}
                </h2>

              </div>

              <div className="rounded-xl bg-blue-50 p-3">

                <Icon
                  size={22}
                  className="text-blue-600"
                />

              </div>

            </div>

          </div>
        );
      })}

    </div>
  );
}

export default DashboardStats;