"use client";

import { useEffect, useState, useCallback } from "react";
import api from "../../../lib/axiosInstance";
import {
  Flag, CheckCircle, XCircle, Clock, ExternalLink, ChevronLeft, ChevronRight, Filter
} from "lucide-react";
import Link from "next/link";

const REASON_LABELS = {
  prohibited_item: "Prohibited Item",
  counterfeit_goods: "Counterfeit / Fake Goods",
  scam_or_fraud: "Scam or Fraud",
  stolen_property: "Stolen Property",
  illegal_eu_law: "Illegal under EU Law",
  gdpr_violation: "GDPR Violation",
  hate_speech: "Hate Speech",
  animal_products: "Illegal Animal Products",
  misleading_info: "Misleading Information",
  duplicate_spam: "Duplicate / Spam",
  unsafe_product: "Unsafe Product (CE)",
  other: "Other",
};

const STATUS_CONFIG = {
  pending:   { label: "Pending",   color: "text-amber-700",  bg: "bg-amber-50",  border: "border-amber-200",  Icon: Clock },
  reviewed:  { label: "Reviewed",  color: "text-blue-700",   bg: "bg-blue-50",   border: "border-blue-200",   Icon: CheckCircle },
  dismissed: { label: "Dismissed", color: "text-gray-500",   bg: "bg-gray-50",   border: "border-gray-200",   Icon: XCircle },
};

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (statusFilter !== "all") params.set("status", statusFilter);
      const res = await api.get(`/admin/reports?${params}`);
      const d = res.data.data;
      setReports(d.reports || []);
      setTotal(d.total || 0);
      setTotalPages(d.totalPages || 1);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load reports.");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const handleStatusChange = async (reportId, newStatus) => {
    setUpdatingId(reportId);
    try {
      await api.patch(`/admin/reports/${reportId}`, { status: newStatus });
      setReports((prev) =>
        prev.map((r) => (r._id === reportId ? { ...r, status: newStatus } : r))
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Reports</h1>
          <p className="text-sm text-gray-500 mt-1">
            {total} total report{total !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <Filter size={15} className="text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="bg-white border border-gray-200 text-sm text-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="dismissed">Dismissed</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200 text-sm">{error}</div>
      )}

      {/* Table */}
      <div className="bg-white shadow-sm border border-gray-100 rounded-2xl overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-5 py-4 font-semibold">Post</th>
              <th className="px-5 py-4 font-semibold">Reason</th>
              <th className="px-5 py-4 font-semibold">Reporter</th>
              <th className="px-5 py-4 font-semibold">Date</th>
              <th className="px-5 py-4 font-semibold">Status</th>
              <th className="px-5 py-4 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-5 py-4">
                      <div className="h-4 bg-gray-100 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : reports.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-5 py-16 text-center text-gray-400">
                  <Flag size={32} className="mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No reports found</p>
                  <p className="text-xs mt-1">Try changing the status filter</p>
                </td>
              </tr>
            ) : (
              reports.map((report) => {
                const cfg = STATUS_CONFIG[report.status] || STATUS_CONFIG.pending;
                const StatusIcon = cfg.Icon;
                const postTitle = report.postId?.title || "Deleted post";
                const postId = report.postId?._id;

                return (
                  <tr key={report._id} className="hover:bg-gray-50/60 transition-colors">
                    {/* Post */}
                    <td className="px-5 py-4 max-w-[200px]">
                      <div className="flex items-center gap-2">
                        {report.postId?.images?.[0] && (
                          <img
                            src={report.postId.images[0]}
                            alt=""
                            className="w-9 h-9 rounded-lg object-cover border border-gray-100 flex-shrink-0"
                          />
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate text-[13px]">{postTitle}</p>
                          {report.postId?.price && (
                            <p className="text-[11px] text-gray-400">€{report.postId.price.toLocaleString()}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Reason */}
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-orange-50 text-orange-700 border border-orange-100">
                        {REASON_LABELS[report.reason] || report.reason}
                      </span>
                      {report.description && (
                        <p className="text-[11px] text-gray-400 mt-1 truncate max-w-[160px]" title={report.description}>
                          "{report.description}"
                        </p>
                      )}
                    </td>

                    {/* Reporter */}
                    <td className="px-5 py-4 text-gray-600 text-[13px]">
                      <p className="font-medium">{report.reporter?.pseudoName || report.reporter?.name || "—"}</p>
                      <p className="text-[11px] text-gray-400">{report.reporter?.email || ""}</p>
                    </td>

                    {/* Date */}
                    <td className="px-5 py-4 text-gray-500 text-[12px] whitespace-nowrap">
                      {new Date(report.createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit", month: "short", year: "numeric",
                      })}
                    </td>

                    {/* Status Badge */}
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${cfg.color} ${cfg.bg} ${cfg.border}`}>
                        <StatusIcon size={11} />
                        {cfg.label}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {postId && (
                          <Link
                            href={`/product/${postId}`}
                            target="_blank"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="View post"
                          >
                            <ExternalLink size={14} />
                          </Link>
                        )}
                        {report.status !== "reviewed" && (
                          <button
                            onClick={() => handleStatusChange(report._id, "reviewed")}
                            disabled={updatingId === report._id}
                            className="px-3 py-1.5 text-[12px] font-semibold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100 transition-colors disabled:opacity-50"
                          >
                            Mark Reviewed
                          </button>
                        )}
                        {report.status !== "dismissed" && (
                          <button
                            onClick={() => handleStatusChange(report._id, "dismissed")}
                            disabled={updatingId === report._id}
                            className="px-3 py-1.5 text-[12px] font-semibold rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200 transition-colors disabled:opacity-50"
                          >
                            Dismiss
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <p>Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors disabled:opacity-40"
            >
              <ChevronLeft size={14} /> Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
              className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors disabled:opacity-40"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
