'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../../../store/useAuthStore';
import {
  Award,
  Medal,
  Gem,
  Save,
  RefreshCcw,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Edit3,
  CreditCard,
  Users,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '');

const PLAN_META = {
  silver: { icon: <Award size={20} className="text-gray-400" />, color: 'gray' },
  golden: { icon: <Medal size={20} className="text-amber-500" />, color: 'amber' },
  platinum: { icon: <Gem size={20} className="text-[#046BD2]" />, color: 'blue' },
};

export default function AdminSubscriptionsPage() {
  const { accessToken } = useAuthStore();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null); // planId being saved
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editState, setEditState] = useState({}); // { [planId]: { ...fields } }

  // ── Fetch plans ─────────────────────────────────────────────────────────────
  const fetchPlans = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/subscriptions/admin/plans`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        setPlans(data.data);
        // Initialize edit state from DB values
        const initial = {};
        for (const plan of data.data) {
          initial[plan.planId] = {
            name: plan.name,
            description: plan.description || '',
            price: plan.price,
            unlockThreshold: plan.unlockThreshold,
            validityDays: plan.validityDays,
            boostsPerMonth: plan.boostsPerMonth,
            isActive: plan.isActive,
            features: [...plan.features],
          };
        }
        setEditState(initial);
      } else {
        setError(data.message);
      }
    } catch {
      setError('Failed to load subscription plans.');
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (accessToken) fetchPlans();
  }, [accessToken, fetchPlans]);

  // ── Field change ─────────────────────────────────────────────────────────────
  const handleChange = (planId, field, value) => {
    setEditState((prev) => ({
      ...prev,
      [planId]: { ...prev[planId], [field]: value },
    }));
  };

  // ── Feature list management ──────────────────────────────────────────────────
  const handleFeatureChange = (planId, idx, value) => {
    const features = [...editState[planId].features];
    features[idx] = value;
    handleChange(planId, 'features', features);
  };

  const addFeature = (planId) => {
    const features = [...editState[planId].features, ''];
    handleChange(planId, 'features', features);
  };

  const removeFeature = (planId, idx) => {
    const features = editState[planId].features.filter((_, i) => i !== idx);
    handleChange(planId, 'features', features);
  };

  // ── Save plan ────────────────────────────────────────────────────────────────
  const handleSave = async (plan) => {
    const updates = editState[plan.planId];
    setSaving(plan.planId);
    setError(null);
    setSuccess(null);

    // Filter empty features
    const cleanFeatures = updates.features.filter((f) => f.trim() !== '');

    try {
      const res = await fetch(`${API_BASE}/api/subscriptions/admin/plans/${plan._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: 'include',
        body: JSON.stringify({ ...updates, features: cleanFeatures }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(`${data.data.name} updated successfully!`);
        await fetchPlans();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.message);
      }
    } catch {
      setError('Failed to save plan.');
    } finally {
      setSaving(null);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CreditCard size={24} className="text-[#046BD2]" />
            Subscription Plans
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage pricing, unlock thresholds, and features for each plan. Changes take effect immediately.
          </p>
        </div>
        <button
          onClick={fetchPlans}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50 transition-all"
        >
          <RefreshCcw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          <AlertCircle size={18} className="flex-shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
          <CheckCircle2 size={18} className="flex-shrink-0" />
          {success}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-1/4 mb-4" />
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="h-16 bg-gray-100 rounded-xl" />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Plan cards */}
      {!loading && plans.map((plan) => {
        const meta = PLAN_META[plan.planId] || PLAN_META.silver;
        const state = editState[plan.planId] || {};
        const isSaving = saving === plan.planId;

        return (
          <div
            key={plan._id}
            className={`bg-white rounded-2xl border-2 shadow-sm transition-all ${
              state.isActive ? 'border-gray-200' : 'border-orange-200 bg-orange-50/30'
            }`}
          >
            {/* Plan header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                {meta.icon}
                <div>
                  <h2 className="font-bold text-gray-900">{plan.name}</h2>
                  <span className="text-xs text-gray-400 font-mono">{plan.planId} · {plan.country}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* Active toggle */}
                <button
                  onClick={() => handleChange(plan.planId, 'isActive', !state.isActive)}
                  className={`flex items-center gap-2 text-sm font-semibold px-3 py-1.5 rounded-lg transition-all ${
                    state.isActive
                      ? 'bg-green-50 text-green-700 hover:bg-green-100'
                      : 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                  }`}
                >
                  {state.isActive ? (
                    <><ToggleRight size={18} /> Active</>
                  ) : (
                    <><ToggleLeft size={18} /> Inactive</>
                  )}
                </button>

                {/* Save button */}
                <button
                  onClick={() => handleSave(plan)}
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-[#046BD2] text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-[#035bb3] transition-all shadow-sm disabled:opacity-60"
                >
                  {isSaving ? (
                    <><Loader2 size={15} className="animate-spin" /> Saving...</>
                  ) : (
                    <><Save size={15} /> Save Changes</>
                  )}
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Row 1: Name + Description */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Plan Name
                  </label>
                  <input
                    type="text"
                    value={state.name || ''}
                    onChange={(e) => handleChange(plan.planId, 'name', e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 font-medium focus:outline-none focus:border-[#046BD2] focus:ring-1 focus:ring-[#046BD2]/30 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Description
                  </label>
                  <input
                    type="text"
                    value={state.description || ''}
                    onChange={(e) => handleChange(plan.planId, 'description', e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-[#046BD2] focus:ring-1 focus:ring-[#046BD2]/30 transition-all"
                  />
                </div>
              </div>

              {/* Row 2: Price + Threshold + Validity + Boosts */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <CreditCard size={12} /> Price (EUR)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">€</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={state.price ?? ''}
                      onChange={(e) => handleChange(plan.planId, 'price', parseFloat(e.target.value) || 0)}
                      className="w-full border border-gray-200 rounded-xl pl-7 pr-3 py-2.5 text-sm text-gray-800 font-bold focus:outline-none focus:border-[#046BD2] focus:ring-1 focus:ring-[#046BD2]/30 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Users size={12} /> Post Threshold
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={state.unlockThreshold ?? ''}
                    onChange={(e) => handleChange(plan.planId, 'unlockThreshold', parseInt(e.target.value) || 0)}
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 font-bold focus:outline-none focus:border-[#046BD2] focus:ring-1 focus:ring-[#046BD2]/30 transition-all"
                  />
                  <p className="text-xs text-gray-400 mt-1">Posts needed for free unlock</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Validity (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={state.validityDays ?? ''}
                    onChange={(e) => handleChange(plan.planId, 'validityDays', parseInt(e.target.value) || 30)}
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 font-bold focus:outline-none focus:border-[#046BD2] focus:ring-1 focus:ring-[#046BD2]/30 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Boosts / Month
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={state.boostsPerMonth ?? ''}
                    onChange={(e) => handleChange(plan.planId, 'boostsPerMonth', parseInt(e.target.value) || 0)}
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 font-bold focus:outline-none focus:border-[#046BD2] focus:ring-1 focus:ring-[#046BD2]/30 transition-all"
                  />
                </div>
              </div>

              {/* Row 3: Features */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                    <Edit3 size={12} /> Features
                  </label>
                  <button
                    onClick={() => addFeature(plan.planId)}
                    className="flex items-center gap-1 text-xs text-[#046BD2] font-bold hover:text-[#035bb3] transition-colors"
                  >
                    <Plus size={14} /> Add Feature
                  </button>
                </div>
                <div className="space-y-2">
                  {(state.features || []).map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <CheckCircle2 size={15} className="text-[#046BD2] flex-shrink-0" />
                      <input
                        type="text"
                        value={feat}
                        onChange={(e) => handleFeatureChange(plan.planId, idx, e.target.value)}
                        placeholder="Enter feature description..."
                        className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-[#046BD2] focus:ring-1 focus:ring-[#046BD2]/20 transition-all"
                      />
                      <button
                        onClick={() => removeFeature(plan.planId, idx)}
                        className="text-red-400 hover:text-red-600 p-1 rounded transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                  {(state.features || []).length === 0 && (
                    <p className="text-sm text-gray-400 italic">No features added. Click "Add Feature" to start.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Empty state */}
      {!loading && plans.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <AlertCircle size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No subscription plans found.</p>
          <p className="text-sm text-gray-400 mt-1">Run the seed script to create default France plans.</p>
          <code className="mt-3 block text-xs bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 font-mono text-gray-600">
            node backend/scripts/seedSubscriptionPlans.js
          </code>
        </div>
      )}
    </div>
  );
}
