import {
  Download,
  FileSpreadsheet,
  FileText,
} from "lucide-react";

function Reports() {
  return (
    <div className="space-y-6">

      <div>

        <h1 className="text-3xl font-semibold">
          Reports
        </h1>

        <p className="mt-2 text-slate-500">
          Export dispute reports and summaries.
        </p>

      </div>

      <div className="grid gap-6 md:grid-cols-2">

        <div className="rounded-2xl border border-slate-200 bg-white p-6">

          <FileSpreadsheet
            size={28}
            className="text-green-600"
          />

          <h2 className="mt-5 text-lg font-semibold">
            Export CSV
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Download disputes in CSV format.
          </p>

          <button className="mt-6 flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-white">

            <Download size={16} />

            Export

          </button>

        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">

          <FileText
            size={28}
            className="text-red-600"
          />

          <h2 className="mt-5 text-lg font-semibold">
            Export PDF
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Download dispute summary report.
          </p>

          <button className="mt-6 flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-white">

            <Download size={16} />

            Export

          </button>

        </div>

      </div>

    </div>
  );
}

export default Reports;