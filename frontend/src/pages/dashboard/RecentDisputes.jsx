import {
  Clock3,
  Eye,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function RecentDisputes() {
  const navigate = useNavigate();

  // Backend API will replace this
  const disputes = [];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white">

      <div className="flex items-center justify-between border-b border-slate-200 p-6">

        <div>

          <h2 className="text-lg font-semibold">
            Recent Disputes
          </h2>

          <p className="text-sm text-slate-500">
            Latest dispute activity
          </p>

        </div>

      </div>

      {disputes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">

          <Clock3
            size={42}
            className="mb-4 text-slate-300"
          />

          <h3 className="font-semibold">
            No disputes found
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            New disputes will appear here.
          </p>

        </div>
      ) : (
        <table className="w-full">

          <thead className="border-b border-slate-200">

            <tr className="text-left text-sm text-slate-500">

              <th className="px-6 py-4">
                Transaction
              </th>

              <th>
                Merchant
              </th>

              <th>
                Amount
              </th>

              <th>
                Status
              </th>

              <th>
                Priority
              </th>

              <th></th>

            </tr>

          </thead>

          <tbody>

            {disputes.map((item) => (

              <tr
                key={item._id}
                className="border-b border-slate-100"
              >

                <td className="px-6 py-5">
                  {item.transactionId}
                </td>

                <td>
                  {item.merchant}
                </td>

                <td>
                  ₹{item.amount}
                </td>

                <td>
                  {item.status}
                </td>

                <td>
                  {item.priority}
                </td>

                <td>

                  <button
                    onClick={() =>
                      navigate(
                        `/dashboard/disputes/${item._id}`
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
      )}

    </div>
  );
}

export default RecentDisputes;