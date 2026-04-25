'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { useAuth } from '../../lib/useAuth';
import api from '../../lib/axiosInstance';
import {
  PlusCircle, Tag, Eye, Trash2, Edit2, ToggleLeft, ToggleRight,
  MapPin, Calendar, Loader2, AlertCircle, RefreshCw, ChevronLeft,
  ChevronRight, Megaphone, Package, ArrowRight, CheckCircle2,
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatPrice = (p) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(p);

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

const getImage = (post) => {
  const valid = post.images?.filter((i) => i && !i.startsWith('blob:'));
  return valid?.length > 0
    ? valid[0]
    : 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?auto=format&fit=crop&w=400&q=80';
};

const getLocation = (post) => {
  if (post.location?.city) return post.location.city;
  if (post.location?.district) return post.location.district;
  return 'Not specified';
};

// ─── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ isActive }) {
  return isActive ? (
    <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 text-[11px] font-bold px-2.5 py-1 rounded-full border border-emerald-200">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
      Active
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-500 text-[11px] font-bold px-2.5 py-1 rounded-full border border-gray-200">
      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block" />
      Inactive
    </span>
  );
}

// ─── Skeleton card ─────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
      <div className="h-44 bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-3 bg-gray-200 rounded w-1/3" />
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="flex gap-2 pt-2">
          <div className="h-8 bg-gray-200 rounded-lg flex-1" />
          <div className="h-8 w-8 bg-gray-200 rounded-lg" />
          <div className="h-8 w-8 bg-gray-200 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// ─── Ad card ──────────────────────────────────────────────────────────────────
function AdCard({ post, onToggle, onDelete, actionLoading }) {
  const isLoading = actionLoading === post._id;

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_32px_rgb(0,0,0,0.10)] transition-all duration-300 overflow-hidden flex flex-col">
      {/* Image */}
      <div className="relative h-44 overflow-hidden bg-gray-50">
        <img
          src={getImage(post)}
          alt={post.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3">
          <StatusBadge isActive={post.isActive} />
        </div>
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <Link
            href={`/product/${post._id}`}
            className="bg-white text-gray-800 p-2.5 rounded-full hover:bg-[#046BD2] hover:text-white transition-colors"
            title="View Ad"
          >
            <Eye size={17} />
          </Link>
          <Link
            href={`/postadd?edit=${post._id}`}
            className="bg-white text-gray-800 p-2.5 rounded-full hover:bg-amber-500 hover:text-white transition-colors"
            title="Edit Ad"
          >
            <Edit2 size={17} />
          </Link>
          <button
            onClick={() => onDelete(post._id)}
            disabled={isLoading}
            className="bg-white text-gray-800 p-2.5 rounded-full hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50"
            title="Delete Ad"
          >
            <Trash2 size={17} />
          </button>
        </div>
        {isLoading && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <Loader2 size={24} className="animate-spin text-[#046BD2]" />
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-grow">
        <p className="text-[11px] text-gray-400 font-medium mb-1 uppercase tracking-wide">
          {post.categoryId?.name || 'Uncategorized'}
        </p>
        <h3 className="text-[15px] font-bold text-gray-900 line-clamp-2 mb-1 min-h-[44px] leading-snug">
          {post.title}
        </h3>
        <p className="text-[#046BD2] font-extrabold text-xl mb-3 tracking-tight">
          {formatPrice(post.price)}
        </p>

        <div className="mt-auto space-y-1.5 text-[12.5px] text-gray-400">
          <div className="flex items-center gap-1.5">
            <MapPin size={12} className="flex-shrink-0" />
            <span className="truncate">{getLocation(post)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar size={12} className="flex-shrink-0" />
            <span>{formatDate(post.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Footer actions */}
      <div className="border-t border-gray-100 px-4 py-3 flex items-center gap-2">
        <Link
          href={`/product/${post._id}`}
          className="flex-1 bg-[#046BD2] hover:bg-[#035bb3] text-white text-[13px] font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all"
        >
          View <ArrowRight size={13} />
        </Link>
        <button
          onClick={() => onToggle(post._id, post.isActive)}
          disabled={isLoading}
          title={post.isActive ? 'Deactivate' : 'Activate'}
          className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-colors disabled:opacity-50 ${
            post.isActive
              ? 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
              : 'border-gray-200 text-gray-400 hover:bg-gray-50'
          }`}
        >
          {post.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
        </button>
        <button
          onClick={() => onDelete(post._id)}
          disabled={isLoading}
          title="Delete"
          className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-colors disabled:opacity-50"
        >
          <Trash2 size={15} />
        </button>
      </div>

      {/* Boost CTA for active ads */}
      {post.isActive && (
        <div className="px-4 pb-3">
          <button className="w-full flex items-center justify-center gap-2 py-2 text-[12px] font-semibold text-[#046BD2] hover:bg-blue-50 rounded-xl border border-[#046BD2]/20 transition-colors">
            <Megaphone size={13} /> Boost Ad
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Delete confirmation modal ─────────────────────────────────────────────────
function DeleteModal({ onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-7 max-w-sm w-full text-center animate-scale-in">
        <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trash2 size={26} className="text-red-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Delete this ad?</h3>
        <p className="text-gray-500 text-sm mb-6">This action is permanent and cannot be undone. All images will also be removed.</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Toast notification ────────────────────────────────────────────────────────
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className={`fixed bottom-6 right-6 z-[300] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-white text-sm font-semibold animate-slide-up ${
      type === 'success' ? 'bg-emerald-500' : 'bg-red-500'
    }`}>
      {type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
      {message}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
const TABS = [
  { key: 'all',      label: 'All Ads'  },
  { key: 'active',   label: 'Active'   },
  { key: 'inactive', label: 'Inactive' },
];

export default function MyAdsPage() {
  const { isChecking, isLoggedIn } = useAuth(true);

  const [posts,        setPosts]        = useState([]);
  const [counts,       setCounts]       = useState({ all: 0, active: 0, inactive: 0 });
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [activeTab,    setActiveTab]    = useState('all');
  const [page,         setPage]         = useState(1);
  const [totalPages,   setTotalPages]   = useState(1);
  const [actionLoading, setActionLoading] = useState(null); // postId being acted on
  const [deleteTarget, setDeleteTarget] = useState(null);   // postId awaiting confirm
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast,        setToast]        = useState(null);   // { message, type }

  const showToast = (message, type = 'success') => setToast({ message, type });

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchPosts = useCallback(async (tab, pg) => {
    setLoading(true);
    setError(null);
    try {
      const params = { page: pg, limit: 12 };
      if (tab !== 'all') params.status = tab;

      const res = await api.get('/posts/my', { params });
      if (res.data?.success) {
        const { posts: p, totalPages: tp, counts: c } = res.data.data;
        setPosts(p);
        setTotalPages(tp);
        if (c) setCounts(c);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load your ads. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) fetchPosts(activeTab, page);
  }, [isLoggedIn, activeTab, page, fetchPosts]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(1);
  };

  // ── Toggle active/inactive ─────────────────────────────────────────────────
  const handleToggle = async (postId, currentActive) => {
    setActionLoading(postId);
    try {
      await api.put(`/posts/${postId}`, { isActive: !currentActive });
      setPosts((prev) =>
        prev.map((p) => p._id === postId ? { ...p, isActive: !currentActive } : p)
      );
      // update counts optimistically
      setCounts((c) => ({
        ...c,
        active:   currentActive ? c.active - 1   : c.active + 1,
        inactive: currentActive ? c.inactive + 1 : c.inactive - 1,
      }));
      showToast(`Ad ${!currentActive ? 'activated' : 'deactivated'} successfully.`);
    } catch {
      showToast('Failed to update ad status.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDeleteRequest = (postId) => setDeleteTarget(postId);
  const handleDeleteCancel  = () => setDeleteTarget(null);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/posts/${deleteTarget}`);
      const removed = posts.find((p) => p._id === deleteTarget);
      setPosts((prev) => prev.filter((p) => p._id !== deleteTarget));
      setCounts((c) => ({
        all:      c.all - 1,
        active:   removed?.isActive ? c.active - 1   : c.active,
        inactive: !removed?.isActive ? c.inactive - 1 : c.inactive,
      }));
      showToast('Ad deleted successfully.');
      setDeleteTarget(null);
      // If page becomes empty after delete, go back
      if (posts.length === 1 && page > 1) setPage((p) => p - 1);
    } catch {
      showToast('Failed to delete ad.', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── Auth/loading guard ─────────────────────────────────────────────────────
  if (isChecking) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 size={40} className="animate-spin text-[#046BD2]" />
            <p className="text-gray-500 font-medium">Loading...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F3F4F6] flex flex-col">
      <Navbar />

      <main className="flex-grow max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">

        {/* ── Page header ─────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Ads</h1>
            <p className="text-gray-500 mt-1 text-sm">Manage your listings, track activity, and update statuses.</p>
          </div>
          <Link
            href="/postadd"
            className="inline-flex items-center gap-2 bg-[#046BD2] hover:bg-[#035bb3] text-white px-5 py-2.5 rounded-xl font-bold shadow-md shadow-blue-500/20 transition-all hover:-translate-y-0.5 text-sm"
          >
            <PlusCircle size={18} /> Post New Ad
          </Link>
        </div>

        {/* ── Stats bar ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Total Ads',    value: counts.all,      color: 'bg-blue-50 border-blue-100',     text: 'text-[#046BD2]' },
            { label: 'Active',       value: counts.active,   color: 'bg-emerald-50 border-emerald-100', text: 'text-emerald-600' },
            { label: 'Inactive',     value: counts.inactive, color: 'bg-gray-50 border-gray-200',     text: 'text-gray-500' },
          ].map((stat) => (
            <div key={stat.label} className={`${stat.color} border rounded-2xl px-4 py-3 text-center`}>
              <p className={`text-2xl font-extrabold ${stat.text}`}>{stat.value}</p>
              <p className="text-[12px] text-gray-500 font-medium mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* ── Status tabs ─────────────────────────────────────────────────── */}
        <div className="flex overflow-x-auto gap-1 border-b border-gray-200 mb-6 pb-px">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`px-5 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab.key
                  ? 'border-[#046BD2] text-[#046BD2]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              <span className={`ml-2 py-0.5 px-2 rounded-full text-[11px] ${
                activeTab === tab.key ? 'bg-blue-100 text-[#046BD2]' : 'bg-gray-100 text-gray-500'
              }`}>
                {counts[tab.key] ?? 0}
              </span>
            </button>
          ))}
        </div>

        {/* ── Error state ─────────────────────────────────────────────────── */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-center gap-4 mb-6">
            <AlertCircle size={24} className="text-red-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-red-700">Something went wrong</p>
              <p className="text-sm text-red-500 mt-0.5">{error}</p>
            </div>
            <button
              onClick={() => fetchPosts(activeTab, page)}
              className="flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-800"
            >
              <RefreshCw size={16} /> Retry
            </button>
          </div>
        )}

        {/* ── Loading skeleton ─────────────────────────────────────────────── */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* ── Empty state ─────────────────────────────────────────────────── */}
        {!loading && !error && posts.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-20 flex flex-col items-center text-center px-6">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-5 border border-gray-100">
              <Package size={40} className="text-gray-300" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No ads found</h3>
            <p className="text-gray-500 text-sm max-w-xs mb-6">
              {activeTab === 'all'
                ? "You haven't posted any ads yet. Start selling today!"
                : `You have no ${activeTab} ads right now.`}
            </p>
            <Link
              href="/postadd"
              className="inline-flex items-center gap-2 bg-[#046BD2] hover:bg-[#035bb3] text-white font-bold px-6 py-3 rounded-xl transition-all hover:-translate-y-0.5 shadow-md shadow-blue-500/20 text-sm"
            >
              <PlusCircle size={16} /> Post Your First Ad
            </Link>
          </div>
        )}

        {/* ── Ads grid ────────────────────────────────────────────────────── */}
        {!loading && !error && posts.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {posts.map((post) => (
                <AdCard
                  key={post._id}
                  post={post}
                  onToggle={handleToggle}
                  onDelete={handleDeleteRequest}
                  actionLoading={actionLoading}
                />
              ))}
            </div>

            {/* ── Pagination ─────────────────────────────────────────────── */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-10">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-white hover:border-[#046BD2] hover:text-[#046BD2] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={18} />
                </button>
                <span className="text-sm font-semibold text-gray-600 px-3">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-white hover:border-[#046BD2] hover:text-[#046BD2] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />

      {/* ── Delete confirmation modal ──────────────────────────────────────── */}
      {deleteTarget && (
        <DeleteModal
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
          loading={deleteLoading}
        />
      )}

      {/* ── Toast ─────────────────────────────────────────────────────────── */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* ── Animations ────────────────────────────────────────────────────── */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.92); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-scale-in { animation: scale-in 0.18s ease-out forwards; }
        .animate-slide-up  { animation: slide-up 0.2s ease-out forwards; }
      `}} />
    </div>
  );
}
