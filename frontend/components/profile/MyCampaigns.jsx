'use client';

import { useEffect, useState } from 'react';
import {
  BarChart3, Eye, Target, MapPin, Calendar, Zap, TrendingUp,
  Loader2, Megaphone, Globe, CheckCircle2, PauseCircle, Clock
} from 'lucide-react';
import api from '../../lib/axiosInstance';

const placementLabels = {
  homepage: { label: 'Homepage Carousel', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
  category: { label: 'Category Feed', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
};

function StatCard({ icon, label, value, sub, colorClass = 'text-[#046BD2]', bgClass = 'bg-blue-50/60' }) {
  return (
    <div className={`${bgClass} rounded-2xl p-5 border border-black/5 flex flex-col justify-between`}>
      <div className="flex items-center gap-2.5 mb-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${bgClass} border border-black/5`}>
          {icon}
        </div>
        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{label}</span>
      </div>
      <p className={`text-3xl font-extrabold ${colorClass} tracking-tight`}>{value}</p>
      {sub && <p className="text-[11px] text-gray-400 mt-1.5 font-medium">{sub}</p>}
    </div>
  );
}

function ProgressBar({ delivered, target }) {
  const pct = target > 0 ? Math.min((delivered / target) * 100, 100) : 0;
  const isComplete = pct >= 100;

  return (
    <div className="w-full">
      <div className="flex justify-between items-end mb-1.5">
        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Delivery Progress</span>
        <span className={`text-[13px] font-extrabold ${isComplete ? 'text-green-600' : 'text-[#046BD2]'}`}>
          {pct.toFixed(1)}%
        </span>
      </div>
      <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${
            isComplete
              ? 'bg-gradient-to-r from-green-400 to-emerald-500'
              : 'bg-gradient-to-r from-[#046BD2] to-indigo-500'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between mt-1.5">
        <span className="text-[11px] text-gray-400 font-medium">{delivered.toLocaleString()} delivered</span>
        <span className="text-[11px] text-gray-400 font-medium">{target.toLocaleString()} target</span>
      </div>
    </div>
  );
}

function CampaignCard({ campaign }) {
  const placement = placementLabels[campaign.placement] || placementLabels.homepage;
  const isActive = campaign.active;
  const isComplete = campaign.delivered_impressions >= campaign.target_impressions;

  const statusConfig = isComplete
    ? { label: 'Completed', icon: <CheckCircle2 size={12} />, cls: 'bg-green-50 text-green-700 border-green-200' }
    : isActive
    ? { label: 'Active', icon: <Zap size={12} />, cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
    : { label: 'Paused', icon: <PauseCircle size={12} />, cls: 'bg-amber-50 text-amber-700 border-amber-200' };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.07)] transition-all duration-300 overflow-hidden group">
      {/* Header */}
      <div className="p-5 pb-0">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0 mr-3">
            <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-[#046BD2] transition-colors">
              {campaign.title}
            </h3>
            {campaign.description && (
              <p className="text-[13px] text-gray-400 mt-1 line-clamp-1">{campaign.description}</p>
            )}
          </div>
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border shrink-0 ${statusConfig.cls}`}>
            {statusConfig.icon} {statusConfig.label}
          </span>
        </div>

        {/* Meta pills */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold ${placement.bg} ${placement.color} ${placement.border} border`}>
            <Globe size={11} /> {placement.label}
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-gray-50 text-gray-500 border border-gray-100">
            <MapPin size={11} /> {campaign.city || 'All Locations'} · {campaign.radius || 10}km
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-gray-50 text-gray-500 border border-gray-100">
            <Calendar size={11} /> {new Date(campaign.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Stats row */}
      <div className="px-5 grid grid-cols-3 gap-3 mb-4">
        <div className="bg-blue-50/50 rounded-xl p-3 text-center border border-blue-50">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Impressions</p>
          <p className="text-xl font-extrabold text-[#046BD2]">{(campaign.delivered_impressions || 0).toLocaleString()}</p>
        </div>
        <div className="bg-indigo-50/50 rounded-xl p-3 text-center border border-indigo-50">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Target</p>
          <p className="text-xl font-extrabold text-indigo-600">{(campaign.target_impressions || 0).toLocaleString()}</p>
        </div>
        <div className="bg-emerald-50/50 rounded-xl p-3 text-center border border-emerald-50">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Remaining</p>
          <p className="text-xl font-extrabold text-emerald-600">
            {Math.max(0, (campaign.target_impressions || 0) - (campaign.delivered_impressions || 0)).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="px-5 pb-5">
        <ProgressBar delivered={campaign.delivered_impressions || 0} target={campaign.target_impressions || 0} />
      </div>
    </div>
  );
}

export default function MyCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const { data } = await api.get('/ads/my-campaigns');
        if (data.success) {
          setCampaigns(data.data.campaigns || []);
          setStats(data.data.stats || null);
        }
      } catch (err) {
        console.error('Failed to fetch campaigns:', err);
        setError('Could not load your campaigns.');
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgb(0,0,0,0.04)] border border-gray-100 p-12 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-[#046BD2] mb-4" size={36} />
        <p className="text-gray-500 font-medium">Loading your campaigns...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgb(0,0,0,0.04)] border border-gray-100 p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#046BD2] via-indigo-500 to-purple-500"></div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
              <BarChart3 size={24} className="text-[#046BD2]" />
              Campaign Dashboard
            </h2>
            <p className="text-gray-500 mt-1 text-sm">Track performance and delivery of your advertisements.</p>
          </div>
        </div>

        {/* Stats cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={<Megaphone size={18} className="text-[#046BD2]" />}
              label="Total Campaigns"
              value={stats.totalCampaigns}
            />
            <StatCard
              icon={<Zap size={18} className="text-emerald-600" />}
              label="Active"
              value={stats.activeCampaigns}
              colorClass="text-emerald-600"
              bgClass="bg-emerald-50/60"
            />
            <StatCard
              icon={<Eye size={18} className="text-indigo-600" />}
              label="Impressions"
              value={stats.totalImpressions.toLocaleString()}
              colorClass="text-indigo-600"
              bgClass="bg-indigo-50/60"
            />
            <StatCard
              icon={<Target size={18} className="text-amber-600" />}
              label="Target Total"
              value={stats.totalTargetImpressions.toLocaleString()}
              colorClass="text-amber-600"
              bgClass="bg-amber-50/60"
            />
          </div>
        )}
      </div>

      {/* Campaign list */}
      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-red-600 font-medium text-sm">
          {error}
        </div>
      )}

      {campaigns.length === 0 && !error ? (
        <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgb(0,0,0,0.04)] border border-gray-100 p-12 flex flex-col items-center justify-center text-center min-h-[300px]">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-[#046BD2] mb-5 shadow-inner border border-blue-100">
            <TrendingUp size={36} />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No campaigns yet</h3>
          <p className="text-gray-500 text-sm max-w-sm leading-relaxed">
            Create your first advertisement campaign to start reaching potential customers in your area.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {campaigns.map(c => (
            <CampaignCard key={c._id} campaign={c} />
          ))}
        </div>
      )}
    </div>
  );
}
