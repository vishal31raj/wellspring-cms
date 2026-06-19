"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { getAuditLogs } from "@/services/audit-logs.api";

const ACTIONS = [
  "",
  "CREATE",
  "UPDATE",
  "DELETE",
  "REORDER",
  "BULK_CREATE",
  "LOGIN",
  "LOGOUT",
  "REGISTER",
];

export default function DashboardPage() {
  const router = useRouter();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const size = 10;
  const [totalPages, setTotalPages] = useState(1);

  const [date, setDate] = useState("");
  const [actionType, setActionType] = useState("");

  const fetchLogs = async () => {
    try {
      setLoading(true);

      const res = await getAuditLogs({
        page,
        size,
        date,
        actionType,
      });

      setLogs(res.data);
      setTotalPages(res.pagination.totalPages);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, date, actionType]);

  const clearFilters = () => {
    setDate("");
    setActionType("");
    setPage(1);
  };

  return (
    <main className="py-5 px-16">
      <div className="flex flex-row items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
        >
          ← Back
        </button>

        <h1 className="text-2xl font-bold">Audit Logs</h1>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6 flex-wrap">
        <input
          type="date"
          value={date}
          onChange={(e) => {
            setPage(1);
            setDate(e.target.value);
          }}
          className="border rounded px-3 py-2"
        />

        <select
          value={actionType}
          onChange={(e) => {
            setPage(1);
            setActionType(e.target.value);
          }}
          className="border rounded px-3 py-2"
        >
          {ACTIONS.map((action) => (
            <option key={action} value={action}>
              {action || "All Actions"}
            </option>
          ))}
        </select>

        <button
          onClick={clearFilters}
          className="px-4 py-2 bg-gray-200 rounded"
        >
          Clear Filters
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border rounded">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-3">Timestamp</th>
              <th className="text-left p-3">Action</th>
              <th className="text-left p-3">Entity</th>
              <th className="text-left p-3">Entity ID</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="text-center p-6">
                  Loading...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center p-6">
                  No audit logs found
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="border-t">
                  <td className="p-3">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="p-3">{log.action}</td>
                  <td className="p-3">{log.targetEntity}</td>
                  <td className="p-3">{log.entityId || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-4 mt-6">
        <button
          disabled={page === 1}
          onClick={() => setPage((prev) => prev - 1)}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          Prev
        </button>

        <span>
          Page {page} / {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage((prev) => prev + 1)}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </main>
  );
}
