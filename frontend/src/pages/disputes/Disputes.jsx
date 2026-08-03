import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";

function Disputes() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  const [disputes, setDisputes] = useState([]);

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    try {
      const res = await API.get("/disputes");

      setDisputes(res.data.disputes);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        Loading...
      </div>
    );
  }

  return (
    <div>

      <div className="mb-8 flex items-center justify-between">

        <div>

          <h1 className="text-3xl font-bold">
            My Disputes
          </h1>

          <p className="mt-2 text-slate-500">
            Track all disputes you've raised.
          </p>

        </div>

        <button
          onClick={() =>
            navigate("/dashboard/raise-dispute")
          }
          className="rounded-xl bg-blue-600 px-5 py-3 text-white"
        >
          Raise Dispute
        </button>

      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">

        <table className="w-full">

          <thead className="bg-slate-50">

            <tr>

              <th className="px-6 py-4 text-left">
                Dispute ID
              </th>

              <th className="text-left">
                Transaction
              </th>

              <th className="text-left">
                Merchant
              </th>

              <th className="text-left">
                Amount
              </th>

              <th className="text-left">
                Status
              </th>

              <th className="text-left">
                Priority
              </th>

            </tr>

          </thead>

          <tbody>

            {disputes.map((item) => (

              <tr
                key={item._id}
                onClick={() =>
                  navigate(
                    `/dashboard/disputes/${item._id}`
                  )
                }
                className="cursor-pointer border-t hover:bg-slate-50"
              >

                <td className="px-6 py-5">

                  {item.disputeId}

                </td>

                <td>

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

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default Disputes;