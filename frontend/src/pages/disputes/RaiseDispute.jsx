import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";

function RaiseDispute() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    transactionId: "",
    orderId: "",
    amount: "",
    merchant: "",
    bank: "",
    paymentGateway: "",
    issueType: "",
    priority: "Medium",
    description: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      await API.post("/disputes", formData);

      alert("Dispute Raised Successfully");

      navigate("/dashboard/disputes");
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl">

      <div className="mb-8">

        <h1 className="text-3xl font-bold">
          Raise New Dispute
        </h1>

        <p className="mt-2 text-slate-500">
          Submit a dispute for investigation.
        </p>

      </div>

     <form
  onSubmit={handleSubmit}
  className="space-y-8"
>

  {/* ================= Transaction Details ================= */}

<div className="rounded-2xl border border-slate-200 bg-white p-6">

  <h2 className="mb-6 text-xl font-semibold">
    Transaction Details
  </h2>

  <div className="grid gap-6 md:grid-cols-2">

    <div>
      <label className="mb-2 block text-sm font-medium">
        Transaction ID *
      </label>

      <input
        type="text"
        name="transactionId"
        value={formData.transactionId}
        onChange={handleChange}
        placeholder="TXN123456789"
        className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-blue-600"
        required
      />
    </div>

    <div>
      <label className="mb-2 block text-sm font-medium">
        Order ID
      </label>

      <input
        type="text"
        name="orderId"
        value={formData.orderId}
        onChange={handleChange}
        placeholder="ORD123456"
        className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-blue-600"
      />
    </div>

    <div>
      <label className="mb-2 block text-sm font-medium">
        Amount *
      </label>

      <input
        type="number"
        name="amount"
        value={formData.amount}
        onChange={handleChange}
        placeholder="2500"
        className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-blue-600"
        required
      />
    </div>

    <div>
      <label className="mb-2 block text-sm font-medium">
        Payment Gateway *
      </label>

      <select
        name="paymentGateway"
        value={formData.paymentGateway}
        onChange={handleChange}
        className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-blue-600"
        required
      >
        <option value="">Select Gateway</option>
        <option value="Razorpay">Razorpay</option>
        <option value="PayU">PayU</option>
        <option value="Cashfree">Cashfree</option>
        <option value="Stripe">Stripe</option>
        <option value="CCAvenue">CCAvenue</option>
      </select>
    </div>

  </div>

</div>

{/* ================= Organization Details ================= */}

<div className="rounded-2xl border border-slate-200 bg-white p-6">

  <h2 className="mb-6 text-xl font-semibold">
    Organization Details
  </h2>

  <div className="grid gap-6 md:grid-cols-2">

    <div>

      <label className="mb-2 block text-sm font-medium">
        Merchant *
      </label>

      <input
        type="text"
        name="merchant"
        value={formData.merchant}
        onChange={handleChange}
        placeholder="Amazon"
        className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-blue-600"
        required
      />

    </div>

    <div>

      <label className="mb-2 block text-sm font-medium">
        Bank *
      </label>

      <input
        type="text"
        name="bank"
        value={formData.bank}
        onChange={handleChange}
        placeholder="HDFC Bank"
        className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-blue-600"
        required
      />

    </div>

  </div>

</div>

{/* ================= Dispute Details ================= */}

<div className="rounded-2xl border border-slate-200 bg-white p-6">

  <h2 className="mb-6 text-xl font-semibold">
    Dispute Details
  </h2>

  <div className="grid gap-6 md:grid-cols-2">

    <div>

      <label className="mb-2 block text-sm font-medium">
        Issue Type *
      </label>

      <select
        name="issueType"
        value={formData.issueType}
        onChange={handleChange}
        className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-blue-600"
        required
      >
        <option value="">Select Issue</option>
        <option value="Payment Failed">Payment Failed</option>
        <option value="Duplicate Payment">Duplicate Payment</option>
        <option value="Refund Pending">Refund Pending</option>
        <option value="Unauthorized Transaction">Unauthorized Transaction</option>
        <option value="Chargeback">Chargeback</option>
        <option value="Wrong Amount">Wrong Amount</option>
        <option value="Merchant Issue">Merchant Issue</option>
        <option value="Bank Issue">Bank Issue</option>
        <option value="Gateway Issue">Gateway Issue</option>
        <option value="Other">Other</option>
      </select>

    </div>

    <div>

      <label className="mb-2 block text-sm font-medium">
        Priority
      </label>

      <select
        name="priority"
        value={formData.priority}
        onChange={handleChange}
        className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-blue-600"
      >
        <option value="Low">Low</option>
        <option value="Medium">Medium</option>
        <option value="High">High</option>
        <option value="Critical">Critical</option>
      </select>

    </div>

  </div>

  <div className="mt-6">

    <label className="mb-2 block text-sm font-medium">
      Description *
    </label>

    <textarea
      rows={5}
      name="description"
      value={formData.description}
      onChange={handleChange}
      placeholder="Describe the dispute in detail..."
      className="w-full rounded-xl border border-slate-300 p-4 outline-none focus:border-blue-600"
      required
    />

  </div>

</div>
{/* ================= Evidence ================= */}

<div className="rounded-2xl border border-slate-200 bg-white p-6">

  <h2 className="mb-6 text-xl font-semibold">
    Supporting Evidence
  </h2>

  <div className="space-y-4">

    <input
      type="file"
      multiple
      className="block w-full rounded-xl border border-slate-300 p-3"
    />

    <p className="text-sm text-slate-500">
      Upload screenshots, bank statements, invoices or payment proofs.
      (Cloudinary integration will be connected next.)
    </p>

  </div>

</div>

{/* ================= Actions ================= */}

<div className="flex justify-end gap-4">

  <button
    type="button"
    onClick={() => navigate("/dashboard")}
    className="rounded-xl border border-slate-300 px-6 py-3 font-medium hover:bg-slate-100"
  >
    Cancel
  </button>

  <button
    type="submit"
    disabled={loading}
    className="rounded-xl bg-blue-600 px-8 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
  >
    {loading ? "Submitting..." : "Raise Dispute"}
  </button>

</div>

</form>

</div>
  );
}

export default RaiseDispute;
      



      