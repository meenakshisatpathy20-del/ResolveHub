import {
  ArrowLeft,
  Clock3,
  Download,
  FileText,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function DisputeDetails() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">

      {/* Header */}

      <div className="flex items-center justify-between">

        <div className="flex items-center gap-4">

          <button
            onClick={() => navigate(-1)}
            className="rounded-lg border border-slate-300 p-2 hover:bg-slate-100"
          >
            <ArrowLeft size={18} />
          </button>

          <div>

            <h1 className="text-3xl font-semibold">
              Dispute DSP-10231
            </h1>

            <p className="mt-1 text-slate-500">
              Created on 05 Aug 2026
            </p>

          </div>

        </div>

        <span className="rounded-full bg-yellow-100 px-4 py-2 text-sm font-medium text-yellow-700">
          Under Review
        </span>

      </div>

      {/* Transaction */}

      <div className="rounded-2xl border border-slate-200 bg-white p-6">

        <h2 className="mb-6 text-lg font-semibold">
          Transaction Information
        </h2>

        <div className="grid grid-cols-2 gap-6">

          <div>

            <p className="text-sm text-slate-500">
              Transaction ID
            </p>

            <p className="font-medium">
              TXN94838291
            </p>

          </div>

          <div>

            <p className="text-sm text-slate-500">
              Order ID
            </p>

            <p className="font-medium">
              ORD908123
            </p>

          </div>

          <div>

            <p className="text-sm text-slate-500">
              Merchant
            </p>

            <p className="font-medium">
              Amazon
            </p>

          </div>

          <div>

            <p className="text-sm text-slate-500">
              Amount
            </p>

            <p className="font-medium">
              ₹2,499
            </p>

          </div>

          <div>

            <p className="text-sm text-slate-500">
              Payment Gateway
            </p>

            <p className="font-medium">
              Razorpay
            </p>

          </div>

          <div>

            <p className="text-sm text-slate-500">
              Bank
            </p>

            <p className="font-medium">
              HDFC Bank
            </p>

          </div>

        </div>

      </div>

      {/* Description */}

      <div className="rounded-2xl border border-slate-200 bg-white p-6">

        <h2 className="mb-4 text-lg font-semibold">
          Issue Description
        </h2>

        <p className="leading-7 text-slate-600">
          Payment was deducted from my account but the
          order was not confirmed. No refund has been
          initiated yet.
        </p>

      </div>

      {/* Evidence */}

      <div className="rounded-2xl border border-slate-200 bg-white p-6">

        <h2 className="mb-5 text-lg font-semibold">
          Supporting Evidence
        </h2>

        <button className="flex items-center gap-3 rounded-xl border border-slate-300 px-5 py-3 hover:bg-slate-100">

          <FileText size={18} />

          Payment_Screenshot.png

          <Download size={16} />

        </button>

      </div>

      {/* Timeline */}

      <div className="rounded-2xl border border-slate-200 bg-white p-6">

        <h2 className="mb-6 text-lg font-semibold">
          Dispute Timeline
        </h2>

        <div className="space-y-6">

          <div className="flex gap-4">

            <Clock3
              size={18}
              className="mt-1 text-blue-600"
            />

            <div>

              <h3 className="font-medium">
                Dispute Raised
              </h3>

              <p className="text-sm text-slate-500">
                05 Aug 2026 • 10:15 AM
              </p>

            </div>

          </div>

          <div className="flex gap-4">

            <Clock3
              size={18}
              className="mt-1 text-blue-600"
            />

            <div>

              <h3 className="font-medium">
                Assigned to Merchant
              </h3>

              <p className="text-sm text-slate-500">
                05 Aug 2026 • 11:02 AM
              </p>

            </div>

          </div>

          <div className="flex gap-4">

            <Clock3
              size={18}
              className="mt-1 text-blue-600"
            />

            <div>

              <h3 className="font-medium">
                Under Review
              </h3>

              <p className="text-sm text-slate-500">
                Current Status
              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default DisputeDetails;