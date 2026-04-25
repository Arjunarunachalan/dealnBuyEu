'use client';

import { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Tag, MapPin, Package, TrendingUp, X, Loader2, ArrowRight } from 'lucide-react';
import api from '../../lib/axiosInstance';

// ─── Icon resolver for categories ──────────────────────────────────────────────
import * as LucideIcons from 'lucide-react';

function CategoryIcon({ name, size = 14, className = '' }) {
  const Icon = LucideIcons[name] || LucideIcons.Tag;
  return <Icon size={size} className={className} />;
}

// ─── Helpers ────────────────────────────────────────────────────────────────────
function formatPrice(price) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price);
}

function highlightMatch(text, query) {
  if (!query || !text) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-yellow-100 text-yellow-900 rounded px-0.5 font-semibold">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

// ─── Popular searches (static fallback when query is empty) ─────────────────────
const POPULAR = ['Cars', 'iPhone', 'Laptops', 'Furniture', 'Bikes', 'Apartments'];

// ─── Main Component ─────────────────────────────────────────────────────────────
const SearchBar = forwardRef(function SearchBar({ className = '', inputClassName = '', placeholder }, ref) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null); // null = no dropdown
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  // Expose imperative submit for external button
  useImperativeHandle(ref, () => ({
    submit: () => {
      if (!query.trim()) return;
      setResults(null);
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    },
  }));

  // ── Close on outside click ──────────────────────────────────────────────────
  useEffect(() => {
    const handleOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setResults(null);
        setFocused(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  // ── Debounced search ─────────────────────────────────────────────────────────
  const fetchResults = useCallback(async (q) => {
    if (!q || q.trim().length < 2) {
      setResults(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get('/search', { params: { q: q.trim() } });
      if (res.data?.success) {
        setResults(res.data.data);
      }
    } catch {
      setResults(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceRef.current);
    if (val.trim().length < 2) {
      setResults(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(() => fetchResults(val), 350);
  };

  // ── Navigate on submit ──────────────────────────────────────────────────────
  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!query.trim()) return;
    setResults(null);
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const handleProductClick = (product) => {
    setResults(null);
    router.push(`/product/${product._id}`);
  };

  const handleCategoryClick = (category) => {
    setResults(null);
    router.push(`/category/${category.slug}`);
  };

  const handleLocationClick = (location) => {
    setResults(null);
    router.push(`/search?q=${encodeURIComponent(query)}&city=${encodeURIComponent(location.city || location.label)}`);
  };

  const handlePopularClick = (term) => {
    setQuery(term);
    fetchResults(term);
  };

  const clearSearch = () => {
    setQuery('');
    setResults(null);
    inputRef.current?.focus();
  };

  // ── Determine whether to show dropdown ──────────────────────────────────────
  const showPopular = focused && !query && !results;
  const hasResults = results && (
    results.products?.length > 0 ||
    results.categories?.length > 0 ||
    results.locations?.length > 0
  );
  const showEmpty = results && !hasResults && !loading;
  const showDropdown = focused && (showPopular || loading || hasResults || showEmpty);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* ── Input bar ──────────────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit} className="flex w-full">
        <div className="flex-1 relative flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => setFocused(true)}
            placeholder={placeholder || 'Find Cars, Mobile Phones and more...'}
            className={`w-full h-full bg-transparent pl-5 pr-10 text-[15px] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-0 ${inputClassName}`}
            suppressHydrationWarning
            autoComplete="off"
          />
          {/* Clear button */}
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-0.5 rounded-full hover:bg-gray-100"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Search button — rendered by the parent but trigger handled here */}
        <button type="submit" className="hidden" aria-label="Search" />
      </form>

      {/* ── Dropdown ───────────────────────────────────────────────────────── */}
      {showDropdown && (
        <div className="absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 w-[min(680px,95vw)] bg-white rounded-2xl shadow-2xl border border-gray-100 z-[9999] overflow-hidden animate-dropdown">
          
          {/* ── Loading state ───────────────────────────────────────────── */}
          {loading && (
            <div className="flex items-center gap-3 px-5 py-4 text-gray-500 text-sm">
              <Loader2 size={16} className="animate-spin text-[#046BD2]" />
              <span>Searching...</span>
            </div>
          )}

          {/* ── Empty state ─────────────────────────────────────────────── */}
          {showEmpty && !loading && (
            <div className="px-5 py-6 text-center">
              <Package size={32} className="mx-auto mb-2 text-gray-300" />
              <p className="text-sm font-medium text-gray-500">No results for <span className="font-semibold text-gray-700">"{query}"</span></p>
              <p className="text-xs text-gray-400 mt-1">Try different keywords or browse categories</p>
            </div>
          )}

          {/* ── Popular searches (no query) ──────────────────────────────── */}
          {showPopular && !loading && (
            <div className="px-4 py-3">
              <div className="flex items-center gap-2 mb-2.5">
                <TrendingUp size={13} className="text-[#046BD2]" />
                <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Popular</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {POPULAR.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => handlePopularClick(term)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-[#046BD2]/10 hover:text-[#046BD2] border border-gray-200 hover:border-[#046BD2]/30 rounded-full text-[13px] text-gray-600 font-medium transition-all duration-150"
                  >
                    <Search size={11} />
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Results ─────────────────────────────────────────────────── */}
          {hasResults && !loading && (
            <>
              {/* Products */}
              {results.products?.length > 0 && (
                <div>
                  <div className="flex items-center justify-between px-4 pt-3 pb-1.5">
                    <div className="flex items-center gap-2">
                      <Package size={13} className="text-[#046BD2]" />
                      <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Products</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="text-[11px] text-[#046BD2] hover:underline font-medium flex items-center gap-1"
                    >
                      See all <ArrowRight size={11} />
                    </button>
                  </div>
                  <ul>
                    {results.products.map((product) => (
                      <li key={product._id}>
                        <button
                          type="button"
                          onClick={() => handleProductClick(product)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors group"
                        >
                          {/* Thumbnail */}
                          <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-200">
                            {product.images?.[0] ? (
                              <img
                                src={product.images[0]}
                                alt={product.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package size={16} className="text-gray-300" />
                              </div>
                            )}
                          </div>

                          {/* Details */}
                          <div className="flex-1 min-w-0 text-left">
                            <p className="text-[13.5px] font-semibold text-gray-800 truncate group-hover:text-[#046BD2] transition-colors">
                              {highlightMatch(product.title, query)}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              {product.categoryId && (
                                <span className="text-[11px] text-gray-400 truncate max-w-[120px]">
                                  {product.categoryId.name}
                                </span>
                              )}
                              {product.location?.city && (
                                <>
                                  <span className="text-gray-300">·</span>
                                  <span className="flex items-center gap-0.5 text-[11px] text-gray-400">
                                    <MapPin size={10} />
                                    {product.location.city}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Price */}
                          <span className="text-[13px] font-bold text-[#046BD2] flex-shrink-0">
                            {formatPrice(product.price)}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Divider */}
              {results.products?.length > 0 && (results.categories?.length > 0 || results.locations?.length > 0) && (
                <div className="mx-4 border-t border-gray-100" />
              )}

              {/* Categories + Locations side by side */}
              {(results.categories?.length > 0 || results.locations?.length > 0) && (
                <div className="flex gap-0 pb-2">
                  {/* Categories */}
                  {results.categories?.length > 0 && (
                    <div className={`flex-1 ${results.locations?.length > 0 ? 'border-r border-gray-100' : ''}`}>
                      <div className="flex items-center gap-2 px-4 pt-3 pb-1.5">
                        <Tag size={13} className="text-emerald-500" />
                        <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Categories</span>
                      </div>
                      <ul>
                        {results.categories.map((cat) => (
                          <li key={cat._id}>
                            <button
                              type="button"
                              onClick={() => handleCategoryClick(cat)}
                              className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-gray-50 transition-colors group"
                            >
                              <span className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
                                <CategoryIcon name={cat.icon} size={13} className="text-emerald-600" />
                              </span>
                              <div className="flex-1 min-w-0 text-left">
                                <p className="text-[13px] font-medium text-gray-700 truncate group-hover:text-emerald-600 transition-colors">
                                  {highlightMatch(cat.name, query)}
                                </p>
                                <p className="text-[11px] text-gray-400">
                                  {cat.level === 0 ? 'Top Category' : cat.level === 1 ? 'Sub-category' : 'Category'}
                                </p>
                              </div>
                              <ArrowRight size={12} className="text-gray-300 group-hover:text-emerald-500 transition-colors" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Locations */}
                  {results.locations?.length > 0 && (
                    <div className="flex-1">
                      <div className="flex items-center gap-2 px-4 pt-3 pb-1.5">
                        <MapPin size={13} className="text-rose-500" />
                        <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Locations</span>
                      </div>
                      <ul>
                        {results.locations.map((loc, i) => (
                          <li key={i}>
                            <button
                              type="button"
                              onClick={() => handleLocationClick(loc)}
                              className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-gray-50 transition-colors group"
                            >
                              <span className="w-7 h-7 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center flex-shrink-0">
                                <MapPin size={13} className="text-rose-500" />
                              </span>
                              <div className="flex-1 min-w-0 text-left">
                                <p className="text-[13px] font-medium text-gray-700 truncate group-hover:text-rose-500 transition-colors">
                                  {highlightMatch(loc.label, query)}
                                </p>
                                <p className="text-[11px] text-gray-400">
                                  {loc.count} {loc.count === 1 ? 'listing' : 'listings'}
                                </p>
                              </div>
                              <ArrowRight size={12} className="text-gray-300 group-hover:text-rose-400 transition-colors" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Footer CTA */}
              <div className="border-t border-gray-100 px-4 py-2.5">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="w-full flex items-center justify-center gap-2 text-[13px] text-[#046BD2] font-semibold hover:bg-[#046BD2]/5 py-1.5 rounded-lg transition-colors"
                >
                  <Search size={13} />
                  Search all results for <span className="underline underline-offset-2">"{query}"</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </>
          )}
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes dropdown-enter {
          from { opacity: 0; transform: translateX(-50%) translateY(-6px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0);   }
        }
        .animate-dropdown {
          animation: dropdown-enter 0.15s ease-out forwards;
        }
      ` }} />
    </div>
  );
});

export default SearchBar;
