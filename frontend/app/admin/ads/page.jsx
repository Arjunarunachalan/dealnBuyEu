"use client";

import { useState, useEffect } from "react";
import api from "../../../lib/axiosInstance";
import { Megaphone, Loader2, Eye, Target } from "lucide-react";
import { format } from "date-fns";

export default function AdsPage() {
  const [ads, setAds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      const { data } = await api.get("/admin/ads");
      if (data.success) {
        setAds(data.data.ads);
      }
    } catch (error) {
      console.error("Failed to fetch ads:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <Megaphone className="text-purple-500" /> Paid Ads
          </h1>
          <p className="text-gray-500 mt-1">Monitor sponsored ad campaigns.</p>
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
                  <th className="px-6 py-4 font-semibold">Campaign</th>
                  <th className="px-6 py-4 font-semibold">Advertiser</th>
                  <th className="px-6 py-4 font-semibold">Placement</th>
                  <th className="px-6 py-4 font-semibold">Performance</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {ads.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-400">
                      No paid ads running.
                    </td>
                  </tr>
                ) : (
                  ads.map((ad) => (
                    <tr key={ad._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{ad.title}</div>
                        <div className="text-xs text-gray-500 truncate max-w-[200px]">{ad.url}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-900">{ad.advertiser?.name}</div>
                        <div className="text-xs text-gray-500">{ad.advertiser?.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 capitalize">
                          {ad.placement}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            <Target size={14} className="text-gray-400"/>
                            Target: <span className="font-medium text-gray-900">{ad.target_impressions.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            <Eye size={14} className="text-blue-500"/>
                            Delivered: <span className="font-medium text-gray-900">{ad.delivered_impressions.toLocaleString()}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                            <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, (ad.delivered_impressions / ad.target_impressions) * 100)}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${ad.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {ad.active ? 'Active' : 'Paused'}
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
