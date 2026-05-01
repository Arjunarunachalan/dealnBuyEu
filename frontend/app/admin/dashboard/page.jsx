"use client";

import { useEffect, useState } from "react";
import api from "../../../lib/axiosInstance";
import { Users, FileText, Flag, TrendingUp, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/admin/stats");
      setStats(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load statistics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  const statCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers ?? 0,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-100",
      href: "/admin/users",
      trend: "View all users →",
    },
    {
      title: "Total Posts",
      value: stats?.totalPosts ?? 0,
      icon: FileText,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-100",
      href: null,
      trend: "Active listings",
    },
    {
      title: "Pending Reports",
      value: stats?.totalReports ?? 0,
      icon: Flag,
      color: "text-red-500",
      bg: "bg-red-50",
      border: "border-red-100",
      href: "/admin/reports",
      trend: "Review reports →",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Overview of your marketplace activity</p>
        </div>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200 text-sm">
          {error}
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          const inner = (
            <div className={`p-6 bg-white rounded-2xl border ${card.border} shadow-sm flex items-center gap-5 hover:shadow-md transition-all group`}>
              <div className={`p-4 rounded-2xl ${card.bg} flex-shrink-0`}>
                <Icon className={`w-7 h-7 ${card.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">{card.title}</p>
                {loading ? (
                  <div className="h-9 w-20 bg-gray-200 rounded-lg animate-pulse" />
                ) : (
                  <p className="text-4xl font-extrabold text-gray-900 tabular-nums">{card.value.toLocaleString()}</p>
                )}
                <p className={`text-xs mt-1.5 font-medium ${card.href ? `${card.color} group-hover:underline` : "text-gray-400"}`}>
                  {card.trend}
                </p>
              </div>
            </div>
          );

          return card.href ? (
            <Link key={card.title} href={card.href}>{inner}</Link>
          ) : (
            <div key={card.title}>{inner}</div>
          );
        })}
      </div>

      {/* Quick Links */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp size={18} className="text-blue-500" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { label: "Manage Users", href: "/admin/users", color: "bg-blue-50 text-blue-700 hover:bg-blue-100" },
            { label: "View Reports", href: "/admin/reports", color: "bg-red-50 text-red-700 hover:bg-red-100" },
            { label: "Categories", href: "/admin/categories", color: "bg-violet-50 text-violet-700 hover:bg-violet-100" },
            { label: "Legal Pages", href: "/admin/legal-pages", color: "bg-gray-50 text-gray-700 hover:bg-gray-100" },
          ].map((q) => (
            <Link
              key={q.label}
              href={q.href}
              className={`px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${q.color}`}
            >
              {q.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
