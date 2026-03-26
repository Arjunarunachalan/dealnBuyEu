'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import { Filter, ChevronDown, SlidersHorizontal, MapPin } from 'lucide-react';
import Navbar from '../../../components/layout/Navbar';
import Footer from '../../../components/layout/Footer';
import ProductCard from '../../../components/products/ProductCard';

export default function CategoryPage({ params }) {
  const resolvedParams = use(params);
  const categorySlug = resolvedParams?.slug || 'all-categories';
  
  // Format slug to readable name
  const categoryName = categorySlug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Mock products data (reusing similar structure to ProductGrid)
  const dummyProducts = [
    {
      id: 1,
      title: "Yamaha R15 V4 Racing Blue",
      price: "₹ 1,85,000",
      location: "Kochi, Kerala",
      badge: "Verified Seller",
      rating: 5,
      imageUrl: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=400",
    },
    {
      id: 2,
      title: "MacBook Pro M2 - Space Gray",
      price: "₹ 1,20,000",
      location: "Ernakulam, Kerala",
      badge: "Featured",
      rating: 4,
      imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=400",
    },
    {
      id: 3,
      title: "Sony Alpha a7 III Mirrorless Camera",
      price: "₹ 1,15,000",
      location: "Trivandrum, Kerala",
      badge: "Recommended",
      rating: 5,
      imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=400",
    },
    {
      id: 4,
      title: "Royal Enfield Classic 350",
      price: "₹ 1,90,000",
      location: "Kozhikode, Kerala",
      badge: "Verified Seller",
      rating: 4,
      imageUrl: "https://images.unsplash.com/photo-1629859586419-4820dc7fc148?auto=format&fit=crop&q=80&w=400",
    },
    {
      id: 5,
      title: "Apple iPhone 14 Pro Max 256GB",
      price: "₹ 1,10,000",
      location: "Thrissur, Kerala",
      badge: "Featured",
      rating: 5,
      imageUrl: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&q=80&w=400",
    },
    {
      id: 6,
      title: "Samsung 55-inch 4K Smart TV",
      price: "₹ 45,000",
      location: "Kochi, Kerala",
      badge: "",
      rating: 3,
      imageUrl: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&q=80&w=400",
    }
  ];

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex flex-col">
      <Navbar />
      
      <main className="flex-grow max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-6 flex flex-wrap gap-1">
          <Link href="/" className="hover:text-[#046BD2]">Home</Link> <span>/</span> 
          <span className="text-gray-900 font-medium truncate">{categoryName}</span>
        </div>

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
              <button className="text-[13px] text-[#046BD2] hover:underline font-medium">Clear All</button>
            </div>

            {/* Price Filter */}
            <div className="mb-6 pb-6 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-4 flex justify-between items-center cursor-pointer">
                Price Range
                <ChevronDown size={16} className="text-gray-500" />
              </h3>
              <div className="flex items-center gap-3 mt-2">
                <input 
                  type="number" 
                  placeholder="Min" 
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#046BD2]"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
                <span className="text-gray-400">-</span>
                <input 
                  type="number" 
                  placeholder="Max" 
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#046BD2]"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>
            </div>

            {/* Brand Filter (Mock) */}
            <div className="mb-6 pb-6 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-4 flex justify-between items-center cursor-pointer">
                Brand
                <ChevronDown size={16} className="text-gray-500" />
              </h3>
              <div className="space-y-3 mt-2">
                {['Apple', 'Samsung', 'Sony', 'Dell', 'HP', 'Lenovo'].map((brand) => (
                  <label key={brand} className="flex items-center cursor-pointer group">
                    <input type="checkbox" className="w-[18px] h-[18px] text-[#046BD2] border-gray-300 rounded focus:ring-0 mr-3 cursor-pointer" />
                    <span className="text-gray-600 text-[14.5px] group-hover:text-gray-900 transition-colors">{brand}</span>
                  </label>
                ))}
              </div>
              <button className="text-[#046BD2] text-[13px] font-medium mt-4 hover:underline">Show more</button>
            </div>

            {/* Condition Filter */}
            <div className="mb-6 pb-6 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-4 flex justify-between items-center cursor-pointer">
                Condition
                <ChevronDown size={16} className="text-gray-500" />
              </h3>
              <div className="space-y-3 mt-2">
                {['New', 'Used - Like New', 'Used - Good', 'Used - Fair'].map((condition) => (
                  <label key={condition} className="flex items-center cursor-pointer group">
                    <input type="checkbox" className="w-[18px] h-[18px] text-[#046BD2] border-gray-300 rounded focus:ring-0 mr-3 cursor-pointer" />
                    <span className="text-gray-600 text-[14.5px] group-hover:text-gray-900 transition-colors">{condition}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Location Filter */}
            <div className="mb-4">
              <h3 className="font-semibold text-gray-800 mb-4 flex justify-between items-center cursor-pointer">
                Location
                <ChevronDown size={16} className="text-gray-500" />
              </h3>
              <div className="relative mt-2">
                <MapPin size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search location..." 
                  className="w-full border border-gray-300 rounded-md pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-[#046BD2]"
                />
              </div>
            </div>
            
            <button className="w-full mt-6 bg-[#046BD2] hover:bg-[#035bb3] text-white font-bold py-3 rounded-md transition-colors shadow-sm">
              Apply Filters
            </button>
          </aside>

          {/* RIGHT COLUMN: Product List */}
          <div className="w-full lg:w-[75%]">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{categoryName}</h1>
                <p className="text-sm text-gray-500 mt-1">Showing {dummyProducts.length} results</p>
              </div>
              
              <div className="flex items-center w-full sm:w-auto">
                <span className="text-sm text-gray-600 mr-3 whitespace-nowrap hidden sm:block">Sort by:</span>
                <select className="w-full sm:w-auto border border-gray-300 rounded-md py-2 px-3 text-[14px] focus:outline-none focus:border-[#046BD2] bg-white cursor-pointer font-medium text-gray-700">
                  <option>Most Relevant</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Newest First</option>
                </select>
              </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 xl:gap-6">
              {dummyProducts.map(product => (
                <div key={product.id} className="h-full">
                  <ProductCard {...product} />
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-10 mb-6 flex justify-center">
              <nav className="flex items-center space-x-2">
                <button className="px-3 py-2 border border-gray-300 rounded-md text-gray-500 hover:bg-gray-50 disabled:opacity-50 text-[14px] font-medium shadow-sm transition-colors" disabled>Previous</button>
                <button className="px-3.5 py-2 border border-[#046BD2] bg-[#046BD2] text-white rounded-md text-[14px] font-bold shadow-sm">1</button>
                <button className="px-3.5 py-2 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 rounded-md text-[14px] font-medium shadow-sm transition-colors">2</button>
                <button className="px-3.5 py-2 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 rounded-md text-[14px] font-medium shadow-sm transition-colors">3</button>
                <span className="px-2 text-gray-500 font-medium">...</span>
                <button className="px-3 py-2 border border-gray-300 bg-white rounded-md text-gray-700 hover:bg-gray-50 text-[14px] font-medium shadow-sm transition-colors">Next</button>
              </nav>
            </div>

          </div>
          
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
