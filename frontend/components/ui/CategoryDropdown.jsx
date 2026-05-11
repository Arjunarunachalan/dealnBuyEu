'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '../../lib/axiosInstance';

export default function CategoryDropdown({ currentCategoryName, defaultText = "Select Category" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchCategories = async () => {
    if (categories.length > 0) return;
    setLoading(true);
    try {
      const { data } = await api.get('/categories');
      setCategories(data?.data || []);
    } catch (err) {
      console.error("Failed to load categories", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    if (!isOpen) {
      fetchCategories();
    }
    setIsOpen(!isOpen);
  };

  const handleSelect = (slug) => {
    setIsOpen(false);
    router.push(`/category/${slug}`);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className="flex items-center hover:bg-gray-50 px-2 py-1 -ml-2 rounded-md transition-colors group cursor-pointer"
      >
        <span className="truncate">{currentCategoryName || defaultText}</span>
        <ChevronDown size={20} className={`ml-2 text-gray-400 group-hover:text-gray-700 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-56 bg-white border border-gray-100 rounded-lg shadow-xl z-50 overflow-hidden max-h-80 overflow-y-auto">
          {loading ? (
             <div className="p-4 flex justify-center"><Loader2 className="animate-spin text-[#046BD2]" size={20} /></div>
          ) : categories.length === 0 ? (
             <div className="p-4 text-sm text-gray-500 text-center">No categories found</div>
          ) : (
            <ul className="py-1">
              {categories.map(cat => (
                <li key={cat._id}>
                  <button
                    onClick={() => handleSelect(cat.slug)}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-[#046BD2] font-medium transition-colors"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
