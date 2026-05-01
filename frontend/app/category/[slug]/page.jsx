'use client';

import { useState, useEffect, use, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Filter, ChevronDown, SlidersHorizontal, MapPin } from 'lucide-react';
import Navbar from '../../../components/layout/Navbar';
import Footer from '../../../components/layout/Footer';
import ProductCard from '../../../components/products/ProductCard';
import api from '../../../lib/axiosInstance';

function CategoryPageContent({ categorySlug, categoryName }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  const activeSubSlug = searchParams.get('sub');

  // State
  const [posts, setPosts] = useState([]);
  const [categoryTree, setCategoryTree] = useState([]);
  const [currentCategory, setCurrentCategory] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Filters State
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [dynamicFilters, setDynamicFilters] = useState({});

  // Reset filters when active subcategory changes
  useEffect(() => {
    setMinPrice('');
    setMaxPrice('');
    setDynamicFilters({});
  }, [activeSubSlug]);

  // 1. Fetch category definition to build dynamic sidebar
  useEffect(() => {
    const fetchCategoryInfo = async () => {
      try {
        const { data } = await api.get('/categories');
        const tree = data?.data || [];
        setCategoryTree(tree);

        // Recursively find current category by slug
        let found = null;
        const traverse = (nodes) => {
          for (let n of nodes) {
            if (n.slug === categorySlug) found = n;
            if (!found && n.children) traverse(n.children);
          }
        };
        traverse(tree);
        setCurrentCategory(found);
      } catch (err) {
        console.error("Failed to fetch categories schema", err);
      }
    };
    fetchCategoryInfo();

    // Fire-and-forget: Track the click!
    api.post(`/categories/slug/${categorySlug}/click`).catch(err => console.error("Click tracking failed", err));
  }, [categorySlug]);

  // Determine the target active category logic based on URL params
  const targetCategory = useMemo(() => {
    if (!currentCategory) return null;
    if (activeSubSlug && currentCategory.children?.length > 0) {
       const child = currentCategory.children.find(c => c.slug === activeSubSlug);
       if (child) return child;
    }
    return currentCategory;
  }, [currentCategory, activeSubSlug]);

  // Aggregated valid attributes for the target category
  const combinedAttributes = useMemo(() => {
    if (!targetCategory) return [];
    
    const attrsMap = new Map();

    const collectAttributes = (node) => {
      if (node.attributes && node.attributes.length > 0) {
        node.attributes.forEach(attr => {
          if (!attrsMap.has(attr.key)) {
            attrsMap.set(attr.key, { ...attr });
          } else {
             const existing = attrsMap.get(attr.key);
             if (existing.options && attr.options) {
                existing.options = Array.from(new Set([...existing.options, ...attr.options]));
             }
          }
        });
      }
      if (node.children?.length > 0) {
        node.children.forEach(collectAttributes);
      }
    };
    
    collectAttributes(targetCategory);
    return Array.from(attrsMap.values());
  }, [targetCategory]);

  const filterableAttributes = combinedAttributes.filter(attr => attr.filterable);

  // 2. Fetch posts whenever filters change (with clean 500ms Auto-Debounce!)
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        let fetchSlug = activeSubSlug || categorySlug;
        let queryParams = `?categorySlug=${fetchSlug}`;
        
        if (minPrice) queryParams += `&minPrice=${minPrice}`;
        if (maxPrice) queryParams += `&maxPrice=${maxPrice}`;
        
        // Append dynamic filters
        for (const [key, val] of Object.entries(dynamicFilters)) {
          if (val) {
            queryParams += `&${key}=${encodeURIComponent(val)}`;
          }
        }

        const { data } = await api.get(`/posts${queryParams}`);
        setPosts(data?.data?.posts || []);
      } catch (err) {
        console.error("Failed to fetch posts", err);
      } finally {
        setLoading(false);
      }
    };

    // Debounce the fetch request by 500ms so it doesn't trigger on every single keystroke for price inputs
    const delayDebounceFn = setTimeout(() => {
      fetchPosts();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [categorySlug, activeSubSlug, minPrice, maxPrice, dynamicFilters]);

  // Handle dynamic filter checks (radio/select behavior)
  const handleDynamicFilterChange = (key, value) => {
    setDynamicFilters(prev => {
      if (prev[key] === value) {
         const newFilters = { ...prev };
         delete newFilters[key];
         return newFilters;
      }
      return { ...prev, [key]: value };
    });
  };

  const clearFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    setDynamicFilters({});
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex flex-col">
      <Navbar />
      
      <main className="flex-grow max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">

        {/* Dynamic Subcategory Header Pill Navigation */}
        {currentCategory?.children?.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center">
               Explore {currentCategory.name} categories
            </h3>
            <div className="flex flex-wrap gap-2.5">
              <button 
                  onClick={() => router.push(pathname, { scroll: false })}
                  className={`px-5 py-2.5 rounded-full text-[14px] font-semibold transition-all shadow-sm border ${
                     !activeSubSlug ? 'bg-gray-800 text-white border-gray-800 shadow' : 'bg-white border-gray-200 text-gray-700 hover:text-[#046BD2] hover:border-[#046BD2] hover:shadow'
                  }`}
                >
                  All {currentCategory.name}
              </button>

              {currentCategory.children.map(child => {
                const isActive = activeSubSlug === child.slug;
                return (
                  <button 
                    key={child._id} 
                    onClick={() => router.push(`${pathname}?sub=${child.slug}`, { scroll: false })}
                    className={`px-5 py-2.5 rounded-full text-[14px] font-semibold transition-all shadow-sm border ${
                      isActive 
                        ? 'bg-blue-50 text-[#046BD2] border-[#046BD2] ring-2 ring-blue-100 shadow' 
                        : 'bg-white border-gray-200 text-gray-700 hover:text-[#046BD2] hover:border-[#046BD2] hover:shadow'
                    }`}
                  >
                    {child.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          
          {/* Mobile Filter Toggle */}
          <button 
            className="lg:hidden flex items-center justify-center w-full bg-white border border-gray-300 rounded-md py-3 text-gray-700 font-medium shadow-sm transition-colors hover:bg-gray-50"
            onClick={() => setShowFiltersMobile(!showFiltersMobile)}
          >
            <SlidersHorizontal size={20} className="mr-2" />
            {showFiltersMobile ? 'Hide Filters' : 'Show Filters'}
          </button>

          {/* LEFT COLUMN: Filters Sidebar */}
          <aside className={`w-full lg:w-[25%] bg-white border border-gray-200 rounded-lg shadow-sm p-5 ${showFiltersMobile ? 'block' : 'hidden lg:block'}`}>
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 flex items-center">
                <Filter size={20} className="mr-2 text-[#046BD2]" />
                Filters
              </h2>
              <button onClick={clearFilters} className="text-[13px] text-[#046BD2] hover:underline font-medium">Clear All</button>
            </div>

            {/* Price Filter */}
            <div className={`pb-6 border-b border-gray-100 ${filterableAttributes.length > 0 ? "mb-6" : "mb-2"}`}>
              <h3 className="font-semibold text-gray-800 mb-4 flex justify-between items-center cursor-pointer">
                Price Range
                <ChevronDown size={16} className="text-gray-500" />
              </h3>
              <div className="flex items-center gap-3 mt-2">
                <input 
                  type="number" 
                  placeholder="Min" 
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#046BD2]"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
                <span className="text-gray-400">-</span>
                <input 
                  type="number" 
                  placeholder="Max" 
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#046BD2]"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>
            </div>

            {/* Empty Attribute state if entirely empty except price */}
            {filterableAttributes.length === 0 && (
               <div className="text-xs text-gray-400 text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-200 font-medium tracking-wide">
                 No other filters available for this specific path.
               </div>
            )}

            {/* Dynamic Attributes Filters (Aggregated natively) */}
            {filterableAttributes.map((attr, index) => (
              <div key={attr.key} className={`pb-6 ${index !== filterableAttributes.length - 1 ? 'border-b border-gray-100 mb-6' : ''}`}>
                <h3 className="font-semibold text-gray-800 mb-4 flex justify-between items-center cursor-pointer capitalize">
                  {attr.label || attr.key.replace('_', ' ')}
                  <ChevronDown size={16} className="text-gray-500" />
                </h3>
                {['select', 'radio', 'checkbox'].includes(attr.type) && attr.options ? (
                  <div className="space-y-3 mt-2 max-h-56 overflow-y-auto custom-scrollbar">
                    {attr.options.map((opt) => (
                      <label key={opt} className="flex items-start cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={dynamicFilters[attr.key] === opt}
                          onChange={() => handleDynamicFilterChange(attr.key, opt)}
                          className="mt-0.5 w-4 h-4 text-[#046BD2] border-gray-300 rounded focus:ring-0 mr-3 cursor-pointer transition-colors" 
                        />
                        <span className="text-gray-600 text-[14.5px] leading-tight group-hover:text-gray-900 transition-colors font-medium">
                          {opt}
                        </span>
                      </label>
                    ))}
                  </div>
                ) : attr.type === 'number' ? (
                  <div className="flex items-center gap-3 mt-2">
                    <input 
                      type="number"
                      placeholder={`Specific ${attr.label}`}
                      value={dynamicFilters[attr.key] || ''}
                      onChange={(e) => handleDynamicFilterChange(attr.key, e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#046BD2]"
                    />
                  </div>
                ) : null}
              </div>
            ))}
          </aside>

          {/* RIGHT COLUMN: Product List */}
          <div className="w-full lg:w-[75%]">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 flex items-center">
                  {targetCategory?.name || categoryName} 
                  <span className="ml-3 px-3 py-1 bg-blue-50 text-[#046BD2] text-sm rounded-full font-bold">
                    {posts.length} Listed
                  </span>
                </h1>
              </div>
              
              <div className="flex items-center w-full sm:w-auto">
                <span className="text-sm text-gray-600 mr-3 whitespace-nowrap hidden sm:block font-medium">Sort by:</span>
                <select className="w-full sm:w-auto border border-gray-200 rounded-lg py-2.5 px-4 text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#046BD2] bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer font-bold text-gray-700">
                  <option>Latest Arrivals</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Product Grid */}
            {loading ? (
               <div className="flex justify-center items-center h-64"><div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div></div>
            ) : posts.length === 0 ? (
               <div className="bg-white p-16 rounded-xl shadow-sm border border-gray-100 text-center flex flex-col items-center justify-center h-full min-h-[300px]">
                 <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
                   <Filter size={32} className="text-gray-300" />
                 </div>
                 <h2 className="text-lg font-bold text-gray-800 mb-2">No {targetCategory?.name || categoryName} found</h2>
                 <p className="text-gray-500 text-sm max-w-sm mb-6">We couldn't find any listings matching your specific filter criteria.</p>
                 <button onClick={clearFilters} className="text-[#046BD2] bg-blue-50 px-6 py-2 rounded-full text-sm font-bold hover:bg-blue-100 transition-colors">
                    Clear All Filters
                 </button>
               </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 xl:gap-6">
                {posts.map(post => (
                  <div key={post._id} className="h-full">
                    <ProductCard 
                       id={post._id}
                       title={post.title}
                       price={`€ ${post.price.toLocaleString()}`}
                       location={post.location?.city || 'Local Pickup'}
                       badge={post.isFeatured ? "Featured" : ""}
                       rating={5} // Mock rating
                       imageUrl={post.images?.[0] || 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=400'}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

export default function CategoryPage({ params }) {
  const resolvedParams = use(params);
  const categorySlug = resolvedParams?.slug || 'all-categories';
  const categoryName = categorySlug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#F3F4F6]"><div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div></div>}>
      <CategoryPageContent categorySlug={categorySlug} categoryName={categoryName} />
    </Suspense>
  );
}
