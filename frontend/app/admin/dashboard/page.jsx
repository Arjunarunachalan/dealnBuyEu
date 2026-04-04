"use client";

import { useEffect, useState } from "react";
import api from "../../../lib/axiosInstance";
import { Users, FileText, ArrowUpRight } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get("/admin/stats");
        setStats(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load statistics.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-md border border-red-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-32 bg-gray-200 rounded-xl animate-pulse"></div>
          <div className="h-32 bg-gray-200 rounded-xl animate-pulse"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatCard
            title="Total Users"
            value={stats?.usersCount ?? 0}
            icon={Users}
            color="text-blue-600"
            bg="bg-blue-100"
          />
          <StatCard
            title="Total Posts"
            value={stats?.postsCount ?? 0}
            icon={FileText}
            color="text-emerald-600"
            bg="bg-emerald-100"
          />
        </div>
      )}
    </div>
  );
}

const StatCard = ({ title, value, icon: Icon, color, bg }) => (
  <div className="p-6 bg-white rounded-xl border shadow-sm flex items-center gap-6 hover:shadow-md transition-shadow">
    <div className={`p-4 rounded-full ${bg}`}>
      <Icon className={`w-8 h-8 ${color}`} />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{title}</p>
      <div className="flex items-baseline gap-2 mt-1">
        <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
      </div>
    </div>
  </div>
);
