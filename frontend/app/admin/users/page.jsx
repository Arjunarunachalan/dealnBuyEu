"use client";

import { useEffect, useState, useCallback } from "react";
import api from "../../../lib/axiosInstance";
import { useAuthStore } from "../../../store/useAuthStore";
import {
  Shield, ShieldAlert, User as UserIcon, Search,
  ChevronLeft, ChevronRight, RefreshCw, Globe
} from "lucide-react";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user: currentUser } = useAuthStore();
  const isSuperAdmin = currentUser?.role === "super_admin";

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (search) params.set("search", search);
      const res = await api.get(`/admin/users?${params}`);
      const d = res.data.data;
      setUsers(d.users || []);
      setTotal(d.total || 0);
      setTotalPages(d.totalPages || 1);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch users.");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // Search on Enter or button click
  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleRoleChange = async (userId, newRole) => {
    if (!isSuperAdmin) return;
    try {
      await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update role");
    }
  };

  const getRoleIcon = (role) => {
    if (role === "super_admin") return <ShieldAlert className="w-4 h-4 text-red-500" />;
    if (role === "admin") return <Shield className="w-4 h-4 text-blue-500" />;
    return <UserIcon className="w-4 h-4 text-gray-400" />;
  };

  const getRoleBadge = (role) => {
    if (role === "super_admin") return "bg-red-50 text-red-700 border-red-100";
    if (role === "admin")       return "bg-blue-50 text-blue-700 border-blue-100";
    return "bg-gray-50 text-gray-600 border-gray-100";
  };

  const roles = ["user", "admin", "super_admin"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Users Management</h1>
          <p className="text-sm text-gray-500 mt-1">{total.toLocaleString()} total user{total !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={fetchUsers}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search by name, email or pseudo..."
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
          />
        </div>
        <button
          onClick={handleSearch}
          className="px-5 py-2.5 bg-[#046BD2] text-white text-sm font-semibold rounded-xl hover:bg-[#035bb3] transition-colors"
        >
          Search
        </button>
        {search && (
          <button
            onClick={() => { setSearch(""); setSearchInput(""); setPage(1); }}
            className="px-4 py-2.5 text-sm text-gray-500 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200 text-sm">{error}</div>
      )}

      {/* Table */}
      <div className="bg-white shadow-sm border border-gray-100 rounded-2xl overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-5 py-4 font-semibold">User</th>
              <th className="px-5 py-4 font-semibold">Email</th>
              <th className="px-5 py-4 font-semibold">Role</th>
              <th className="px-5 py-4 font-semibold">Country</th>
              <th className="px-5 py-4 font-semibold">Joined</th>
              {isSuperAdmin && <th className="px-5 py-4 font-semibold text-right">Change Role</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: isSuperAdmin ? 6 : 5 }).map((_, j) => (
                    <td key={j} className="px-5 py-4">
                      <div className="h-4 bg-gray-100 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={isSuperAdmin ? 6 : 5} className="px-5 py-16 text-center text-gray-400">
                  <UserIcon size={32} className="mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No users found</p>
                  <p className="text-xs mt-1">Try a different search term</p>
                </td>
              </tr>
            ) : (
              users.map((user) => {
                const displayName = user.pseudoName || user.name || "—";
                const fullName = [user.name, user.surname].filter(Boolean).join(" ") || "—";
                const initial = displayName.charAt(0).toUpperCase();

                return (
                  <tr key={user._id} className="hover:bg-gray-50/60 transition-colors">
                    {/* User */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm flex-shrink-0">
                          {initial}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-[13px]">{displayName}</p>
                          <p className="text-[11px] text-gray-400">{fullName}</p>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-5 py-4 text-gray-600 text-[13px]">{user.email || "—"}</td>

                    {/* Role */}
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${getRoleBadge(user.role)}`}>
                        {getRoleIcon(user.role)}
                        {user.role?.replace("_", " ")}
                      </span>
                    </td>

                    {/* Country */}
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 text-[12px] text-gray-500 font-medium">
                        <Globe size={12} className="text-gray-300" />
                        {user.country || "—"}
                      </span>
                    </td>

                    {/* Joined */}
                    <td className="px-5 py-4 text-gray-400 text-[12px]">
                      {new Date(user.createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit", month: "short", year: "numeric",
                      })}
                    </td>

                    {/* Role Change (super_admin only) */}
                    {isSuperAdmin && (
                      <td className="px-5 py-4 text-right">
                        {user._id !== currentUser?._id ? (
                          <select
                            className="bg-gray-50 border border-gray-200 text-gray-700 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-400 px-2 py-1.5"
                            value={user.role}
                            onChange={(e) => handleRoleChange(user._id, e.target.value)}
                          >
                            {roles.map((r) => (
                              <option key={r} value={r}>{r.replace("_", " ")}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-[11px] text-gray-300 italic">You</span>
                        )}
                      </td>
                    )}
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
          <p>Page {page} of {totalPages} · {total} users</p>
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
