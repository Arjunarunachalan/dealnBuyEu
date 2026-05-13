"use client";

import { useState, useEffect } from "react";
import api from "../../../lib/axiosInstance";
import { Crown, Loader2, Calendar } from "lucide-react";
import { format } from "date-fns";

export default function PremiumUsersPage() {
  const [subs, setSubs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPremiumUsers();
  }, []);

  const fetchPremiumUsers = async () => {
    try {
      const { data } = await api.get("/admin/premium-users");
      if (data.success) {
        setSubs(data.data.premiumUsers);
      }
    } catch (error) {
      console.error("Failed to fetch premium users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <Crown className="text-yellow-500" /> Premium Users
          </h1>
          <p className="text-gray-500 mt-1">Manage users with active subscriptions.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-blue-500 h-8 w-8" />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-700">
                <tr>
                  <th className="px-6 py-4 font-semibold">User</th>
                  <th className="px-6 py-4 font-semibold">Plan</th>
                  <th className="px-6 py-4 font-semibold">Start Date</th>
                  <th className="px-6 py-4 font-semibold">End Date</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {subs.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-400">
                      No premium users found.
                    </td>
                  </tr>
                ) : (
                  subs.map((sub) => (
                    <tr key={sub._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {sub.user?.name} {sub.user?.surname}
                        </div>
                        <div className="text-xs text-gray-500">{sub.user?.email}</div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-800">
                        {sub.planName}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-gray-500">
                          <Calendar size={14} />
                          {format(new Date(sub.startDate), "MMM d, yyyy")}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-gray-500">
                          <Calendar size={14} />
                          {format(new Date(sub.endDate), "MMM d, yyyy")}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
