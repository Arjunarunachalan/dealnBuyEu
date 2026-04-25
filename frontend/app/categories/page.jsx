'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import api from '../../lib/axiosInstance';
import { DynamicIcon } from '../../lib/iconResolver';

// Colour palette for auto-assigning colours to API categories
const colourPalette = [
  { color: 'text-blue-500',   bg: 'bg-blue-50' },
  { color: 'text-orange-500', bg: 'bg-orange-50' },
  { color: 'text-purple-500', bg: 'bg-purple-50' },
  { color: 'text-teal-500',   bg: 'bg-teal-50' },
  { color: 'text-indigo-500', bg: 'bg-indigo-50' },
  { color: 'text-amber-500',  bg: 'bg-amber-50' },
  { color: 'text-rose-500',   bg: 'bg-rose-50' },
  { color: 'text-green-500',  bg: 'bg-green-50' },
  { color: 'text-pink-500',   bg: 'bg-pink-50' },
  { color: 'text-yellow-600', bg: 'bg-yellow-50' },
  { color: 'text-cyan-600',   bg: 'bg-cyan-50' },
  { color: 'text-red-500',    bg: 'bg-red-50' },
  { color: 'text-gray-800',   bg: 'bg-gray-100' },
  { color: 'text-blue-600',   bg: 'bg-blue-100' },
  { color: 'text-slate-600',  bg: 'bg-slate-100' },
  { color: 'text-gray-500',   bg: 'bg-gray-100' },
];

// ─── Loading skeleton ─────────────────────────────────────────────────────────
const CategorySkeleton = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-10">
    {Array.from({ length: 12 }).map((_, i) => (
      <div key={i} className="flex flex-col items-center gap-4 animate-pulse">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-200" />
        <div className="w-16 h-3 rounded bg-gray-200" />
      </div>
    ))}
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AllCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/categories');

        // API returns { success, data: [...tree] }
        // We display only root-level categories; children are for subcategory pages.
        const rootCats = data?.data ?? [];
        setCategories(rootCats);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        setError('Could not load categories. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex flex-col">
      <Navbar />

      <main className="flex-grow max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-8 border-b border-gray-100 pb-4">
            Browse All Categories
          </h1>

          {/* Error state */}
          {error && (
            <div className="text-center py-10">
              <p className="text-red-500 font-medium">{error}</p>
            </div>
          )}

          {/* Loading skeleton */}
          {loading && !error && <CategorySkeleton />}

          {/* Empty state */}
          {!loading && !error && categories.length === 0 && (
            <div className="text-center py-10 text-gray-400">
              No categories available yet.
            </div>
          )}

          {/* Category grid */}
          {!loading && !error && categories.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-10">
              {categories.map((cat, index) => {
                const palette = colourPalette[index % colourPalette.length];
                return (
                  <Link
                    key={cat._id}
                    href={`/category/${cat.slug}`}
                    className="flex flex-col items-center justify-center group"
                  >
                    <div
                      className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center ${palette.bg} mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm border border-black/5`}
                    >
                      <DynamicIcon
                        name={cat.icon}
                        size={40}
                        className={`${palette.color} group-hover:scale-110 transition-transform duration-300`}
                      />
                    </div>
                    <span className="text-[15px] font-bold text-gray-800 text-center leading-tight group-hover:text-[#046BD2] transition-colors">
                      {cat.name}
                    </span>
                    {/* Show child count badge if category has children */}
                    {cat.children?.length > 0 && (
                      <span className="mt-1 text-xs text-gray-400">
                        {cat.children.length} sub-categor{cat.children.length === 1 ? 'y' : 'ies'}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
