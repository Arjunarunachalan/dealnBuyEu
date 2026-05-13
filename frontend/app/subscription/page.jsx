'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { useAuthStore } from '../../store/useAuthStore';
import {
  Target,
  LockOpen,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Medal,
  Award,
  Gem,
  CreditCard,
  Loader2,
  Lock,
  ShieldCheck,
  RefreshCcw,
  AlertCircle,
} from 'lucide-react';

// ─── Icon map ─────────────────────────────────────────────────────────────────
const PLAN_ICONS = {
  silver: <Award className="text-gray-400" size={28} />,
  golden: <Medal className="text-yellow-500" size={28} />,
  platinum: <Gem className="text-[#046BD2]" size={28} />,
};

const PLAN_COLORS = {
  silver: {
    accent: '#6B7280',
    border: 'border-gray-300',
    activeBorder: 'border-[#10B981]',
    badge: 'bg-gray-100 text-gray-600',
    progress: 'bg-gray-400',
    progressBg: 'bg-gray-200',
    tag: 'bg-gray-500',
  },
  golden: {
    accent: '#F59E0B',
    border: 'border-amber-200',
    activeBorder: 'border-[#10B981]',
    badge: 'bg-amber-50 text-amber-600',
    progress: 'bg-amber-400',
    progressBg: 'bg-amber-100',
    tag: 'bg-amber-500',
  },
  platinum: {
    accent: '#046BD2',
    border: 'border-blue-200',
    activeBorder: 'border-[#10B981]',
    badge: 'bg-blue-50 text-blue-600',
    progress: 'bg-[#046BD2]',
    progressBg: 'bg-blue-100',
    tag: 'bg-[#046BD2]',
  },
};

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '');


export default function SubscriptionPage() {
  const router = useRouter();
  const { user, accessToken, isChecking, hydrate } = useAuthStore();

  const [plans, setPlans] = useState([]);
  const [subscription, setSubscription] = useState(null); // user's active sub
  const [postCount, setPostCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activating, setActivating] = useState(null); // planId being activated
  const [paying, setPaying] = useState(null);         // planId being paid

  // Hydrate auth on mount
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Redirect if not logged in
  useEffect(() => {
    if (!isChecking && !user) {
      router.replace('/registration_login');
    }
  }, [isChecking, user, router]);

  // Fetch plans + user subscription
  const fetchData = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);

    try {
      const headers = { Authorization: `Bearer ${accessToken}` };

      const [plansRes, myRes] = await Promise.all([
        fetch(`${API_BASE}/api/subscriptions/plans`, {
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        }),
        fetch(`${API_BASE}/api/subscriptions/my`, {
          headers,
          credentials: 'include',
        }),
      ]);

      const plansData = await plansRes.json();
      const myData = await myRes.json();

      if (plansData.success) setPlans(plansData.data || []);
      if (myData.success) {
        setSubscription(myData.data.subscription || null);
        setPostCount(myData.data.postCount || 0);
      }
    } catch (err) {
      setError('Failed to load subscription data. Please refresh.');
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (accessToken) fetchData();
  }, [accessToken, fetchData]);

  // ── Activate via posts ───────────────────────────────────────────────────────
  const handleActivateFree = async (planId) => {
    setActivating(planId);
    try {
      const res = await fetch(`${API_BASE}/api/subscriptions/activate-free`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: 'include',
        body: JSON.stringify({ planId }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchData(); // Refresh state
      } else {
        alert(data.message || 'Activation failed.');
      }
    } catch {
      alert('Network error. Please try again.');
    } finally {
      setActivating(null);
    }
  };

  // ── Activate via payment ─────────────────────────────────────────────────────
  const handlePay = async (planId) => {
    setPaying(planId);
    try {
      const res = await fetch(`${API_BASE}/api/subscriptions/initiate-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: 'include',
        body: JSON.stringify({ planId }),
      });
      const data = await res.json();
      if (data.success && data.data.paymentUrl) {
        window.location.href = data.data.paymentUrl;
      } else {
        alert(data.message || 'Payment system is not available yet. Please try again later.');
      }
    } catch {
      alert('Network error. Please try again.');
    } finally {
      setPaying(false);
    }
  };

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const isActivePlan = (planId) => subscription?.planId === planId && subscription?.status === 'active';
  const isThresholdMet = (threshold) => postCount >= threshold;
  const progressPercent = (threshold) => Math.min(100, Math.round((postCount / threshold) * 100));

  // ─────────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-blue-400/10 rounded-full blur-3xl mix-blend-multiply pointer-events-none" />
      <div className="absolute top-[20%] right-[-5%] w-[30rem] h-[30rem] bg-indigo-400/10 rounded-full blur-3xl mix-blend-multiply pointer-events-none" />
      <div className="absolute bottom-[10%] left-[10%] w-80 h-80 bg-amber-400/5 rounded-full blur-3xl mix-blend-multiply pointer-events-none" />

      <Navbar />

      <div className="flex-grow max-w-[1200px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 z-10 relative">

        {/* ── Header ──────────────────────────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10 mb-16">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 bg-[#046BD2]/10 text-[#046BD2] text-xs font-bold px-3 py-1.5 rounded-full mb-4 uppercase tracking-wider">
              <ShieldCheck size={14} /> Subscription Plans
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight tracking-tight mb-4">
              We've got a plan <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#046BD2] to-indigo-600">
                that's perfect for you
              </span>
            </h1>
            <div className="flex items-center bg-white/60 backdrop-blur-sm border border-pink-100 px-4 py-2.5 rounded-full w-fit shadow-sm gap-2">
              <Target className="text-pink-500 flex-shrink-0" size={18} />
              <p className="font-semibold text-gray-700 text-sm">
                Post ads to unlock plans for FREE — or upgrade instantly by paying!
              </p>
            </div>
          </div>

          {/* ── Ad Count Widget ─────────────────────────────────────────────── */}
          <div className="bg-white p-5 rounded-2xl shadow-xl shadow-blue-900/5 border border-gray-100 w-full lg:w-80 transform hover:-translate-y-1 transition-transform duration-300">
            <div className="flex justify-between items-center bg-gradient-to-r from-[#046BD2] to-[#035bb3] text-white px-4 py-3 rounded-xl font-bold mb-4 shadow-md">
              <span className="tracking-wide text-sm">Your Active Posts</span>
              <span className="bg-white text-[#046BD2] px-3 py-1 rounded-lg text-lg font-extrabold shadow-sm">
                {loading ? '...' : postCount}
              </span>
            </div>
            <div className="space-y-3">
              {[
                { id: 'silver', label: 'Silver', threshold: plans.find(p => p.planId === 'silver')?.unlockThreshold || 10, colors: PLAN_COLORS.silver, icon: <Award size={18} className="text-gray-500" /> },
                { id: 'golden', label: 'Golden', threshold: plans.find(p => p.planId === 'golden')?.unlockThreshold || 20, colors: PLAN_COLORS.golden, icon: <Medal size={18} className="text-amber-500" /> },
                { id: 'platinum', label: 'Platinum', threshold: plans.find(p => p.planId === 'platinum')?.unlockThreshold || 40, colors: PLAN_COLORS.platinum, icon: <Gem size={18} className="text-[#046BD2]" /> },
              ].map(({ id, label, threshold, colors, icon }) => {
                const pct = progressPercent(threshold);
                const met = isThresholdMet(threshold);
                return (
                  <div key={id} className={`flex items-center p-3 rounded-xl border transition-colors ${met ? 'bg-green-50 border-green-100' : `${colors.badge.split(' ')[0]} border-gray-100`}`}>
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center mr-3 shadow-sm ${met ? 'bg-green-100' : colors.progressBg}`}>
                      {met ? <CheckCircle2 size={18} className="text-[#10B981]" /> : icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <p className={`text-xs font-bold ${met ? 'text-[#10B981]' : colors.badge.split(' ')[1]}`}>{label}</p>
                        <p className="text-xs text-gray-400 font-medium">{postCount}/{threshold}</p>
                      </div>
                      <div className={`w-full rounded-full h-1.5 ${colors.progressBg}`}>
                        <div
                          className={`h-1.5 rounded-full transition-all duration-700 ${met ? 'bg-[#10B981]' : colors.progress}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {subscription && (
              <div className="mt-4 bg-[#10B981]/10 border border-[#10B981]/20 rounded-xl px-4 py-2.5 flex items-center gap-2">
                <ShieldCheck size={16} className="text-[#10B981]" />
                <p className="text-xs font-bold text-[#10B981]">
                  Active: {plans.find(p => p.planId === subscription.planId)?.name || subscription.planId}
                  {' '}— expires {new Date(subscription.expiresAt).toLocaleDateString('fr-FR')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Error / Loading ──────────────────────────────────────────────────── */}
        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl mb-8">
            <AlertCircle size={20} className="flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
            <button
              onClick={fetchData}
              className="ml-auto flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-800 transition-colors"
            >
              <RefreshCcw size={14} /> Retry
            </button>
          </div>
        )}

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-[24px] border-2 border-gray-100 p-8 animate-pulse">
                <div className="h-6 bg-gray-200 rounded-lg w-3/4 mx-auto mb-6" />
                <div className="h-12 bg-gray-100 rounded-xl mb-6" />
                <div className="h-10 bg-gray-200 rounded-xl mb-4" />
                <div className="space-y-3 mt-6">
                  {[1, 2, 3, 4].map(j => <div key={j} className="h-4 bg-gray-100 rounded w-5/6" />)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Plan Cards Grid ──────────────────────────────────────────────────── */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {plans.map((plan) => {
              const colors = PLAN_COLORS[plan.planId] || PLAN_COLORS.silver;
              const isActive = isActivePlan(plan.planId);
              const thresholdMet = isThresholdMet(plan.unlockThreshold);
              const isActivatingThis = activating === plan.planId;
              const isPayingThis = paying === plan.planId;

              return (
                <div
                  key={plan._id}
                  className={`relative bg-white rounded-[24px] shadow-lg hover:shadow-2xl border-2 transition-all duration-300 flex flex-col hover:-translate-y-2
                    ${isActive ? colors.activeBorder : colors.border + ' hover:border-[#046BD2]/30'}
                  `}
                >
                  {/* Status tag */}
                  <div className={`absolute -top-4 left-1/2 -translate-x-1/2 text-white text-[11px] font-extrabold px-4 py-1.5 rounded-full flex items-center shadow-lg uppercase tracking-wider z-10
                    ${isActive ? 'bg-[#10B981]' : thresholdMet ? 'bg-[#046BD2]' : colors.tag}
                  `}>
                    {isActive ? (
                      <><ShieldCheck size={13} className="mr-1.5" /> Active Plan</>
                    ) : thresholdMet ? (
                      <><LockOpen size={13} className="mr-1.5" /> Unlocked Free!</>
                    ) : (
                      <><TrendingUp size={13} className="mr-1.5" /> {plan.unlockThreshold} Posts to Unlock</>
                    )}
                  </div>

                  <div className="pt-10 pb-6 px-7 flex-1 flex flex-col">
                    <h3 className="text-2xl font-bold text-gray-900 mb-1 text-center flex items-center justify-center gap-2">
                      {PLAN_ICONS[plan.planId]} {plan.name}
                    </h3>
                    <p className="text-center text-gray-400 text-sm mb-5">{plan.description}</p>

                    {/* ── Price Box ─────────────────────────────────────────── */}
                    <div className="rounded-2xl border-2 border-dashed border-gray-100 p-4 mb-5 bg-gray-50/60">
                      <div className="flex items-center justify-between">
                        {/* Free path */}
                        <div className="text-center flex-1">
                          <div className={`inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide mb-1 ${thresholdMet ? 'text-[#10B981]' : 'text-gray-400'}`}>
                            {thresholdMet ? <CheckCircle2 size={12} /> : <Lock size={12} />}
                            Free Path
                          </div>
                          <p className="text-2xl font-extrabold text-gray-800">FREE</p>
                          <p className="text-xs text-gray-400 mt-0.5">{plan.unlockThreshold} posts required</p>
                          <div className={`mt-2 text-xs font-bold px-2 py-0.5 rounded-full inline-block ${thresholdMet ? 'bg-green-100 text-[#10B981]' : 'bg-gray-100 text-gray-400'}`}>
                            {thresholdMet ? `✓ You qualify` : `${postCount}/${plan.unlockThreshold} posts`}
                          </div>
                        </div>

                        {/* Divider */}
                        <div className="flex flex-col items-center mx-3">
                          <div className="h-8 w-px bg-gray-200" />
                          <span className="text-[10px] font-bold text-gray-300 my-1">OR</span>
                          <div className="h-8 w-px bg-gray-200" />
                        </div>

                        {/* Paid path */}
                        <div className="text-center flex-1">
                          <div className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-[#046BD2] mb-1">
                            <CreditCard size={12} /> Pay Now
                          </div>
                          <p className="text-2xl font-extrabold text-gray-800">
                            €{plan.price.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">{plan.currency} / {plan.validityDays} days</p>
                          <div className="mt-2 text-xs font-bold px-2 py-0.5 rounded-full inline-block bg-blue-50 text-[#046BD2]">
                            Instant access
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ── CTA Buttons ───────────────────────────────────────── */}
                    {isActive ? (
                      <div className="w-full font-bold py-3.5 rounded-xl flex justify-center items-center bg-[#10B981] text-white gap-2 cursor-default shadow-md">
                        <ShieldCheck size={18} />
                        <span>Active Plan</span>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2.5">
                        {/* Free activation button */}
                        <button
                          onClick={() => handleActivateFree(plan.planId)}
                          disabled={!thresholdMet || !!activating || !!paying}
                          className={`w-full font-bold py-3 rounded-xl flex justify-center items-center gap-2 transition-all duration-300 text-sm
                            ${thresholdMet
                              ? 'bg-[#10B981] text-white hover:bg-[#059669] hover:shadow-lg shadow-[#10B981]/20'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                        >
                          {isActivatingThis ? (
                            <><Loader2 size={16} className="animate-spin" /> Activating...</>
                          ) : thresholdMet ? (
                            <><LockOpen size={16} /> Activate Free (Posts)</>
                          ) : (
                            <><Lock size={16} /> Need {plan.unlockThreshold - postCount} more posts</>
                          )}
                        </button>

                        {/* Pay button */}
                        <button
                          onClick={() => handlePay(plan.planId)}
                          disabled={!!activating || !!paying}
                          className="w-full font-bold py-3 rounded-xl flex justify-center items-center gap-2 transition-all duration-300 text-sm bg-white border-2 border-[#046BD2] text-[#046BD2] hover:bg-[#046BD2] hover:text-white hover:shadow-lg shadow-[#046BD2]/10"
                        >
                          {isPayingThis ? (
                            <><Loader2 size={16} className="animate-spin" /> Redirecting...</>
                          ) : (
                            <><CreditCard size={16} /> Pay €{plan.price.toFixed(2)}</>
                          )}
                        </button>
                      </div>
                    )}

                    {/* ── Features ──────────────────────────────────────────── */}
                    <div className="mt-6">
                      <h4 className="font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4 text-xs uppercase tracking-wider">
                        What you get
                      </h4>
                      <ul className="space-y-3">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start text-[14px] text-gray-600 font-medium leading-tight">
                            <CheckCircle2 size={16} className="text-[#046BD2] mr-2.5 mt-0.5 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                        <li className="flex items-start text-[14px] text-gray-600 font-medium">
                          <Sparkles size={16} className="text-amber-400 mr-2.5 mt-0.5 flex-shrink-0" />
                          <span>{plan.boostsPerMonth} Boosts / month</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Empty state if no plans */}
            {plans.length === 0 && !loading && (
              <div className="col-span-3 flex flex-col items-center justify-center py-20 text-gray-400">
                <AlertCircle size={48} className="mb-4 opacity-30" />
                <p className="text-lg font-medium">No subscription plans available yet.</p>
                <p className="text-sm mt-1">Please check back later or contact support.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
