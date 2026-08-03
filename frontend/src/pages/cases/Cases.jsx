import {
  Plus,
  Search,
  Filter,
  Eye,
} from "lucide-react";

function Cases() {
  return (
    <div className="space-y-8">

      {/* Header */}

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-3xl font-bold text-slate-900">
            Disputes
          </h1>

          <p className="mt-2 text-slate-500">
            View and manage all dispute investigations.
          </p>

        </div>

        <button className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700">

          <Plus size={18} />

          New Dispute

        </button>

      </div>

      {/* Toolbar */}

      <div className="rounded-2xl border bg-white p-5">

        <div className="flex items-center justify-between">

          <div className="relative">

            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search disputes..."
              className="h-11 w-80 rounded-xl border border-slate-300 pl-11 pr-4 outline-none focus:border-blue-500"
            />

          </div>

          <button className="flex items-center gap-2 rounded-xl border px-4 py-2 hover:bg-slate-50">

            <Filter size={18} />

            Filters

          </button>

        </div>

      </div>

      {/* Table */}

      <div className="overflow-hidden rounded-2xl border bg-white">

        <table className="w-full">

          <thead className="bg-slate-50">

            <tr className="text-left text-sm font-semibold text-slate-600">

              <th className="px-6 py-4">Case ID</th>

              <th>Customer</th>

              <th>Category</th>

              <th>Status</th>

              <th>Priority</th>

              <th>Assigned To</th>

              <th className="text-center">Action</th>

            </tr>

          </thead>

          <tbody>

            <tr>

              <td
                colSpan={7}
                className="py-24 text-center"
              >

                <div className="flex flex-col items-center">

                  <Search
                    size={46}
                    className="text-slate-300"
                  />

                  <h2 className="mt-6 text-xl font-semibold">

                    No disputes found

                  </h2>

                  <p className="mt-2 text-slate-500">

                    Create your first dispute to begin
                    tracking investigations.

                  </p>

                  <button className="mt-8 flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-white hover:bg-blue-700">

                    <Plus size={18} />

                    Create Dispute

                  </button>

                </div>

              </td>

            </tr>

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default Cases;