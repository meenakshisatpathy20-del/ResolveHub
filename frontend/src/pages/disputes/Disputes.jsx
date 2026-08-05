import { useNavigate } from "react-router-dom";
import { Search, Filter, Eye } from "lucide-react";

function Disputes() {
  const navigate = useNavigate();

  const disputes = [
    {
      id: "DSP-10231",
      merchant: "Amazon",
      amount: "₹2,499",
      status: "Under Review",
      priority: "High",
      updated: "Today",
    },
    {
      id: "DSP-10232",
      merchant: "Flipkart",
      amount: "₹899",
      status: "Resolved",
      priority: "Medium",
      updated: "Yesterday",
    },
    {
      id: "DSP-10233",
      merchant: "Swiggy",
      amount: "₹499",
      status: "Open",
      priority: "Low",
      updated: "2 Days Ago",
    },
  ];

  return (
    <div className="space-y-6">

      {/* Header */}

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-3xl font-semibold text-slate-900">
            My Disputes
          </h1>

          <p className="mt-1 text-slate-500">
            View and manage all disputes.
          </p>

        </div>

        <button
          onClick={() =>
            navigate("/dashboard/raise-dispute")
          }
          className="rounded-xl bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
        >
          + Raise Dispute
        </button>

      </div>

      {/* Filters */}

      <div className="flex gap-4">

        <div className="relative flex-1">

          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            placeholder="Search by Dispute ID or Merchant..."
            className="h-12 w-full rounded-xl border border-slate-300 pl-11 pr-4 outline-none focus:border-blue-600"
          />

        </div>

        <button className="flex items-center gap-2 rounded-xl border border-slate-300 px-5">

          <Filter size={18} />

          Filters

        </button>

      </div>

      {/* Table */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">

        <table className="w-full">

          <thead className="bg-slate-50">

            <tr>

              <th className="px-6 py-4 text-left text-sm font-semibold">
                Dispute ID
              </th>

              <th className="text-left text-sm font-semibold">
                Merchant
              </th>

              <th className="text-left text-sm font-semibold">
                Amount
              </th>

              <th className="text-left text-sm font-semibold">
                Status
              </th>

              <th className="text-left text-sm font-semibold">
                Priority
              </th>

              <th className="text-left text-sm font-semibold">
                Updated
              </th>

              <th className="text-center text-sm font-semibold">
                Action
              </th>

            </tr>

          </thead>

          <tbody>

            {disputes.map((item) => (

              <tr
                key={item.id}
                className="border-t hover:bg-slate-50"
              >

                <td className="px-6 py-5 font-medium">
                  {item.id}
                </td>

                <td>{item.merchant}</td>

                <td>{item.amount}</td>

                <td>

                  <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">

                    {item.status}

                  </span>

                </td>

                <td>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      item.priority === "High"
                        ? "bg-red-100 text-red-700"
                        : item.priority === "Medium"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {item.priority}
                  </span>

                </td>

                <td>{item.updated}</td>

                <td className="text-center">

                  <button
                    onClick={() =>
                      navigate(
                        `/dashboard/disputes/${item.id}`
                      )
                    }
                    className="rounded-lg p-2 hover:bg-slate-100"
                  >
                    <Eye size={18} />
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default Disputes;