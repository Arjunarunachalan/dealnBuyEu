"use client";

import { useEffect, useState } from "react";
import api from "../../../lib/axiosInstance";
import { useAuthStore } from "../../../store/useAuthStore";
import { Shield, ShieldAlert, User as UserIcon } from "lucide-react";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { user: currentUser } = useAuthStore();
  const isSuperAdmin = currentUser?.role === "super_admin";

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/users?page=1&limit=50");
      setUsers(res.data.data.users || res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    if (!isSuperAdmin) return;
    try {
      await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      fetchUsers(); // refresh data
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update role");
    }
  };

  const getRoleIcon = (role) => {
    if (role === 'super_admin') return <ShieldAlert className="w-4 h-4 text-red-600" />;
    if (role === 'admin') return <Shield className="w-4 h-4 text-blue-600" />;
    return <UserIcon className="w-4 h-4 text-gray-500" />;
  };

  const roles = ["user", "admin", "super_admin"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Users Management</h1>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-md border border-red-200">
          {error}
        </div>
      )}

      <div className="bg-white shadow-sm border rounded-xl overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-6 py-4 font-semibold tracking-wider">Name</th>
              <th className="px-6 py-4 font-semibold tracking-wider">Surname</th>
              <th className="px-6 py-4 font-semibold tracking-wider">Pseudo Name</th>
              <th className="px-6 py-4 font-semibold tracking-wider">Email</th>
              <th className="px-6 py-4 font-semibold tracking-wider">Role</th>
              <th className="px-6 py-4 font-semibold tracking-wider">Joined</th>
              {isSuperAdmin && <th className="px-6 py-4 font-semibold tracking-wider text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                  </div>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {user.name}
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {user.surname}
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {user.pseudoName}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {user.email}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       {getRoleIcon(user.role)}
                       <span className={`capitalize font-medium ${
                         user.role === 'super_admin' ? 'text-red-700' :
                         user.role === 'admin' ? 'text-blue-700' : 'text-gray-700'
                       }`}>
                         {user.role.replace('_', ' ')}
                       </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                  {isSuperAdmin && (
                    <td className="px-6 py-4 text-right">
                      {user._id !== currentUser?._id && (
                        <select
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                          value={user.role}
                          onChange={(e) => handleRoleChange(user._id, e.target.value)}
                        >
                          {roles.map((r) => (
                            <option key={r} value={r}>
                              Make {r.replace('_', ' ')}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
