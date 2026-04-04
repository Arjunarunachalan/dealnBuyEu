'use client';

import { useEffect, useState } from 'react';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';
import api from '../../lib/axiosInstance';
import { DynamicIcon } from '../../lib/iconResolver';

const colourPalette = [
  { color: 'text-blue-500',   bg: 'bg-blue-50' },
  { color: 'text-orange-500', bg: 'bg-orange-50' },
  { color: 'text-purple-500', bg: 'bg-purple-50' },
  { color: 'text-teal-500',   bg: 'bg-teal-50' },
  { color: 'text-indigo-500', bg: 'bg-indigo-50' },
  { color: 'text-amber-500',  bg: 'bg-amber-50' },
  { color: 'text-rose-500',   bg: 'bg-rose-50' },
  { color: 'text-green-500',  bg: 'bg-green-50' },
];

export default function CategoryGrid() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get('/categories');
        // Only show up to 7 root categories + View All on the homepage
        setCategories(data?.data?.slice(0, 7) ?? []);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <section className="py-8 bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6 px-2">Popular Categories</h2>
        
        {loading ? (
          <div className="grid grid-cols-4 md:grid-cols-4 lg:grid-cols-8 gap-4 px-2 animate-pulse">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex flex-col items-center justify-center">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gray-200 mb-3"></div>
                <div className="w-12 h-3 rounded bg-gray-200"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-4 md:grid-cols-4 lg:grid-cols-8 gap-4 px-2">
            {categories.map((cat, index) => {
              const palette = colourPalette[index % colourPalette.length];
              return (
                <Link 
                  key={cat._id} 
                  href={`/category/${cat.slug}`}
                  className="flex flex-col items-center justify-center group"
                >
                  <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center ${palette.bg} mb-3 group-hover:scale-110 transition-transform duration-300 shadow-sm border border-black/5`}>
                    <DynamicIcon name={cat.icon} size={32} className={`${palette.color} group-hover:scale-110 transition-transform duration-300`} />
                  </div>
                  <span className="text-[13px] md:text-[14px] font-medium text-gray-700 text-center leading-tight">
                    {cat.name}
                  </span>
                </Link>
              );
            })}

            {/* View All Button */}
            <Link 
              href="/categories"
              className="flex flex-col items-center justify-center group"
            >
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center bg-gray-100 mb-3 group-hover:scale-110 transition-transform duration-300 shadow-sm border border-black/5">
                <PlusCircle size={32} className="text-gray-500 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <span className="text-[13px] md:text-[14px] font-medium text-gray-700 text-center leading-tight">
                View All
              </span>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
