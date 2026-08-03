import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload } from "lucide-react";
import API from "../../services/api";

function RaiseDispute() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [files, setFiles] = useState([]);

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

  const handleFileChange = (e) => {
    setFiles([...e.target.files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const form = new FormData();

      Object.keys(formData).forEach((key) => {
        form.append(key, formData[key]);
      });

      files.forEach((file) => {
        form.append("evidence", file);
      });

      await API.post("/disputes", form, {
        headers: {
          "Content-Type":
            "multipart/form-data",
        },
      });

      alert("Dispute Raised Successfully");

      navigate("/dashboard/disputes");
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Unable to raise dispute."
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
        <option value="Stripe">Stripe</option>
        <option value="PayU">PayU</option>
        <option value="Cashfree">Cashfree</option>
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

        <option value="Unauthorized Transaction">
          Unauthorized Transaction
        </option>

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

  <input
    type="file"
    id="evidenceUpload"
    multiple
    accept=".jpg,.jpeg,.png,.pdf"
    onChange={handleFileChange}
    className="hidden"
  />

  <label
    htmlFor="evidenceUpload"
    className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-10 transition hover:border-blue-600 hover:bg-blue-50"
  >

    <Upload
      size={40}
      className="mb-3 text-blue-600"
    />

    <h3 className="font-semibold">
      Upload Supporting Documents
    </h3>

    <p className="mt-2 text-center text-sm text-slate-500">
      Drag & Drop or Click to upload screenshots,
      invoices, bank statements or payment proofs.
    </p>

    <p className="mt-2 text-xs text-slate-400">
      Maximum 5 files • JPG • PNG • PDF
    </p>

  </label>

  {files.length > 0 && (

    <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">

      <h4 className="mb-3 font-semibold">

        Selected Files

      </h4>

      <div className="space-y-2">

        {files.map((file, index) => (

          <div
            key={index}
            className="flex items-center justify-between rounded-lg bg-white px-4 py-3 shadow-sm"
          >

            <span className="truncate text-sm">

              {file.name}

            </span>

            <span className="text-xs text-slate-500">

              {(file.size / 1024).toFixed(1)} KB

            </span>

          </div>

        ))}

      </div>

    </div>

  )}

</div>

{/* ================= Actions ================= */}

<div className="flex items-center justify-end gap-4">

  <button
    type="button"
    onClick={() => navigate("/dashboard/disputes")}
    className="rounded-xl border border-slate-300 px-6 py-3 font-medium transition hover:bg-slate-100"
  >
    Cancel
  </button>

  <button
    type="submit"
    disabled={loading}
    className="rounded-xl bg-blue-600 px-8 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
  >

    {loading
      ? "Submitting..."
      : "Raise Dispute"}

  </button>

</div>

</form>

</div>

  );
}

export default RaiseDispute;


      