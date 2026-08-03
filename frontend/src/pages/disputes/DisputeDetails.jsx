import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../../services/api";

function DisputeDetails() {
  const { id } = useParams();

  const [loading, setLoading] = useState(true);

  const [dispute, setDispute] = useState(null);

  useEffect(() => {
    fetchDispute();
  }, []);

  const fetchDispute = async () => {
    try {
      const res = await API.get(`/disputes/${id}`);

      setDispute(res.data.dispute);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        Loading...
      </div>
    );
  }

  if (!dispute) {
    return (
      <div className="py-20 text-center">
        Dispute Not Found
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}

      <div className="rounded-2xl border border-slate-200 bg-white p-6">

        <h1 className="text-2xl font-bold">

          {dispute.disputeId}

        </h1>

        <p className="mt-2 text-slate-500">

          {dispute.status}

        </p>

      </div>

      {/* Details */}

      <div className="grid gap-6 lg:grid-cols-2">

        <div className="rounded-2xl border border-slate-200 bg-white p-6">

          <h2 className="mb-5 text-lg font-semibold">
            Transaction
          </h2>

          <div className="space-y-3">

            <p>
              <strong>Transaction ID:</strong>{" "}
              {dispute.transactionId}
            </p>

            <p>
              <strong>Order ID:</strong>{" "}
              {dispute.orderId}
            </p>

            <p>
              <strong>Merchant:</strong>{" "}
              {dispute.merchant}
            </p>

            <p>
              <strong>Bank:</strong>{" "}
              {dispute.bank}
            </p>

            <p>
              <strong>Gateway:</strong>{" "}
              {dispute.paymentGateway}
            </p>

            <p>
              <strong>Amount:</strong> ₹
              {dispute.amount}
            </p>

          </div>

        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">

          <h2 className="mb-5 text-lg font-semibold">
            Dispute
          </h2>

          <div className="space-y-3">

            <p>

              <strong>Issue:</strong>{" "}

              {dispute.issueType}

            </p>

            <p>

              <strong>Priority:</strong>{" "}

              {dispute.priority}

            </p>

            <p>

              <strong>Next Action:</strong>{" "}

              {dispute.nextActionBy}

            </p>

            <p>

              <strong>Description</strong>

            </p>

            <div className="rounded-xl bg-slate-50 p-4">

              {dispute.description}

            </div>

          </div>

        </div>

      </div>

      {/* Timeline */}

      <div className="rounded-2xl border border-slate-200 bg-white p-6">

        <h2 className="mb-6 text-lg font-semibold">
          Timeline
        </h2>

        <div className="space-y-5">

          {dispute.timeline.map((item, index) => (

            <div
              key={index}
              className="flex gap-4"
            >

              <div className="mt-2 h-3 w-3 rounded-full bg-blue-600"></div>

              <div>

                <h3 className="font-medium">

                  {item.action}

                </h3>

                <p className="text-sm text-slate-500">

                  {item.performedBy}

                </p>

                <p className="text-xs text-slate-400">

                  {new Date(
                    item.timestamp
                  ).toLocaleString()}

                </p>

              </div>

            </div>

          ))}

        </div>

      </div>

      {/* Evidence */}

      <div className="rounded-2xl border border-slate-200 bg-white p-6">

        <h2 className="mb-6 text-lg font-semibold">

          Evidence

        </h2>

        {dispute.evidence.length === 0 ? (

          <p className="text-slate-500">

            No evidence uploaded.

          </p>

        ) : (

          <div className="space-y-3">

            {dispute.evidence.map((file) => (

              <a
                key={file.fileUrl}
                href={file.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="block rounded-lg border border-slate-200 p-3 hover:bg-slate-50"
              >

                {file.fileName}

              </a>

            ))}

          </div>

        )}

      </div>

    </div>
  );
}

export default DisputeDetails;