"use client";

import { bulkUploadSessions } from "@/services/sessions.api";
import { useState } from "react";
import toast from "react-hot-toast";
import {
  FaUpload,
  FaTimes,
  FaCheckCircle,
  FaExclamationCircle,
} from "react-icons/fa";

export default function BulkUploadModal({ programId, onUploadSuccess }) {
  const [showModal, setShowModal] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [report, setReport] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith(".csv")) {
      toast.error("Please select a valid CSV file");
      return;
    }
    setFile(selectedFile);
    setReport(null); // Clear previous reports
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please select a file first");
      return;
    }

    setUploading(true);
    setReport(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("bulkImportId", crypto.randomUUID());

    try {
      const result = await bulkUploadSessions(programId, formData);
      setReport(result); // Pass parsed server logs straight to UI state!
      toast.success("Bulk import complete!");
    } catch (error) {
      toast.error(error.message);
    } finally {
      onUploadSuccess();
      setUploading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setFile(null);
    setReport(null);
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setShowModal(true)}
        className="px-3 flex gap-2 items-center rounded-md border border-blue-600 bg-transparent py-2 text-blue-600 text-sm hover:bg-blue-50 transition-colors"
      >
        <FaUpload /> Upload CSV
      </button>

      {/* Modal Screen */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="mb-4 flex items-center justify-between border-b pb-3">
              <h2 className="text-xl font-bold text-zinc-800">
                Bulk Import Sessions
              </h2>
              <button
                onClick={closeModal}
                className="text-zinc-400 hover:text-zinc-600"
              >
                <FaTimes size={18} />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleUpload}
              className="space-y-4 flex-1 overflow-y-auto pr-1"
            >
              {!report && (
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-300 rounded-lg p-8 bg-zinc-50 text-center">
                  <FaUpload className="text-zinc-400 text-3xl mb-3" />
                  <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
                    Select CSV File
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  {file && (
                    <p className="mt-3 text-sm font-medium text-emerald-600">
                      Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                    </p>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              {!report && (
                <button
                  type="submit"
                  disabled={uploading || !file}
                  className="w-full rounded-md bg-blue-600 py-2.5 text-white font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors flex justify-center items-center gap-2"
                >
                  {uploading ? "Processing rows..." : "Start Import"}
                </button>
              )}
            </form>

            {/* Row Validation Feedback Report View */}
            {report && (
              <div className="mt-4 flex-1 flex flex-col overflow-hidden">
                <div className="bg-zinc-100 p-3 rounded-md mb-3 text-sm text-zinc-700 flex justify-between font-medium">
                  <span>Processed: {report.meta?.totalRowsProcessed} rows</span>
                  <span className="text-emerald-600">
                    Success: {report.meta?.successCount}
                  </span>
                  <span className="text-red-600">
                    Failed: {report.meta?.errorCount}
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 border rounded-md p-2 bg-zinc-50 max-h-[40vh]">
                  <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                    Row Report Logs
                  </h4>
                  {report.report?.map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-md border flex items-start gap-3 bg-white ${
                        item.status === "success"
                          ? "border-emerald-100"
                          : "border-red-100"
                      }`}
                    >
                      {item.status === "success" ? (
                        <FaCheckCircle className="text-emerald-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <FaExclamationCircle className="text-red-500 mt-0.5 flex-shrink-0" />
                      )}

                      <div className="text-sm">
                        <span className="font-semibold text-zinc-700">
                          Row {item.row}:{" "}
                        </span>
                        {item.status === "success" ? (
                          <span className="text-emerald-700">
                            Imported successfully.
                          </span>
                        ) : item.status.includes("skipped") ? (
                          <span className="text-amber-600">
                            Skipped (Idempotent match)
                          </span>
                        ) : (
                          <div className="mt-1">
                            <span className="text-red-700 font-medium">
                              Validation failed:
                            </span>
                            <ul className="list-disc list-inside text-xs text-red-600 mt-0.5 space-y-0.5">
                              {item.errors?.map((err, eIdx) => (
                                <li key={eIdx}>{err}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={closeModal}
                  className="mt-4 w-full border border-zinc-300 py-2 rounded-md text-sm font-medium hover:bg-zinc-50 text-zinc-700 transition-colors"
                >
                  Close Report
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
