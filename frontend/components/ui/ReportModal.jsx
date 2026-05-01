"use client";

import { useState } from "react";
import { X, Flag, AlertTriangle, CheckCircle } from "lucide-react";
import api from "../../lib/axiosInstance";

// EU-specific report reasons with icons and descriptions
const REPORT_REASONS = [
  {
    value: "prohibited_item",
    label: "Prohibited Item",
    desc: "Weapons, drugs, explosives or other banned goods",
    icon: "🚫",
  },
  {
    value: "counterfeit_goods",
    label: "Counterfeit / Fake Branded Goods",
    desc: "Violates EU anti-counterfeiting regulation",
    icon: "🏷️",
  },
  {
    value: "scam_or_fraud",
    label: "Scam or Fraud",
    desc: "Suspected phishing, advance-fee scam or deceptive trade",
    icon: "⚠️",
  },
  {
    value: "stolen_property",
    label: "Stolen Property",
    desc: "Listing appears to be stolen or illegally obtained",
    icon: "🔓",
  },
  {
    value: "illegal_eu_law",
    label: "Illegal under EU Consumer Law",
    desc: "Violates EU Directive 2019/771 or product safety laws",
    icon: "⚖️",
  },
  {
    value: "gdpr_violation",
    label: "GDPR / Privacy Violation",
    desc: "Contains personal data or violates EU privacy regulation",
    icon: "🔒",
  },
  {
    value: "hate_speech",
    label: "Hate Speech or Discrimination",
    desc: "Content that promotes hatred, racism or discrimination",
    icon: "🛑",
  },
  {
    value: "animal_products",
    label: "Illegal Animal Products",
    desc: "CITES-protected species or illegal wildlife trade (EU reg. 338/97)",
    icon: "🐾",
  },
  {
    value: "misleading_info",
    label: "Misleading or False Information",
    desc: "Deceptive description, specs or photos",
    icon: "📋",
  },
  {
    value: "duplicate_spam",
    label: "Duplicate / Spam Listing",
    desc: "Same item posted multiple times to flood results",
    icon: "📋",
  },
  {
    value: "unsafe_product",
    label: "Unsafe Product (CE Marking)",
    desc: "Missing CE mark or safety certificate required in EU",
    icon: "⚡",
  },
  {
    value: "other",
    label: "Other",
    desc: "Something else that violates our community guidelines",
    icon: "💬",
  },
];

export default function ReportModal({ postId, postTitle, onClose }) {
  const [selectedReason, setSelectedReason] = useState(null);
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!selectedReason) return;
    setIsSubmitting(true);
    setError("");
    try {
      await api.post("/reports", {
        postId,
        reason: selectedReason,
        description: description.trim(),
      });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden"
        style={{ animation: "slideUp 0.25s ease-out" }}
      >
        <style>{`
          @keyframes slideUp {
            from { transform: translateY(30px); opacity: 0; }
            to   { transform: translateY(0);    opacity: 1; }
          }
        `}</style>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center">
              <Flag size={18} className="text-red-500" />
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-gray-900 leading-tight">Report Listing</h2>
              {postTitle && (
                <p className="text-xs text-gray-400 truncate max-w-[240px]">{postTitle}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-400 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        {submitted ? (
          /* ── Success State ── */
          <div className="flex flex-col items-center justify-center gap-4 py-14 px-8 text-center">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
              <CheckCircle size={32} className="text-green-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Report Submitted</h3>
            <p className="text-sm text-gray-500 max-w-xs">
              Thank you for helping keep our marketplace safe. Our moderation team will review this listing within 24–48 hours.
            </p>
            <button
              onClick={onClose}
              className="mt-2 px-8 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-full hover:bg-gray-700 transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <p className="text-sm text-gray-500 mb-4">
                Select the reason that best describes the issue. All reports are confidential.
              </p>

              {/* Reason List */}
              <div className="space-y-2">
                {REPORT_REASONS.map((r) => (
                  <button
                    key={r.value}
                    onClick={() => setSelectedReason(r.value)}
                    className={`w-full flex items-start gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all ${
                      selectedReason === r.value
                        ? "border-red-400 bg-red-50"
                        : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-xl leading-none mt-0.5 flex-shrink-0">{r.icon}</span>
                    <div className="min-w-0">
                      <p className={`text-[14px] font-semibold leading-tight ${selectedReason === r.value ? "text-red-700" : "text-gray-800"}`}>
                        {r.label}
                      </p>
                      <p className="text-[12px] text-gray-400 mt-0.5 leading-snug">{r.desc}</p>
                    </div>
                    {/* Radio dot */}
                    <div className={`ml-auto mt-1 w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                      selectedReason === r.value ? "border-red-500 bg-red-500" : "border-gray-300"
                    }`}>
                      {selectedReason === r.value && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Optional description */}
              <div className="mt-4">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                  Additional details (optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={1000}
                  rows={3}
                  placeholder="Describe the issue in more detail..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-red-300/40 focus:border-red-400 transition"
                />
                <p className="text-[11px] text-gray-400 text-right mt-0.5">{description.length}/1000</p>
              </div>

              {error && (
                <div className="mt-3 flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <AlertTriangle size={15} className="text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3 flex-shrink-0">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!selectedReason || isSubmitting}
                className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Submitting...</>
                ) : (
                  <><Flag size={15} /> Submit Report</>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
