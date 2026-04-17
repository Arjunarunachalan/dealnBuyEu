'use client';

import React, { useState } from 'react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import Link from 'next/link';
import { Edit2, Trash2, Eye, Heart, Tag, Calendar, MoreVertical, PlusCircle, Megaphone } from 'lucide-react';

const initialAds = [
  {
    id: "AD-10023",
    title: "2021 Apple MacBook Pro 14\" M1 Pro",
    price: "€1,450",
    category: "Electronics",
    date: "14 Apr 2026",
    status: "active",
    views: 142,
    likes: 12,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=400&h=300",
  },
  {
    id: "AD-10045",
    title: "BMW 3 Series 320d M Sport 2018",
    price: "€22,500",
    category: "Vehicles",
    date: "12 Apr 2026",
    status: "active",
    views: 845,
    likes: 45,
    image: "https://images.unsplash.com/photo-1555353540-64fd1b1909e4?auto=format&fit=crop&q=80&w=400&h=300",
  },
  {
    id: "AD-10088",
    title: "Vintage Leather Sofa - Excellent Condition",
    price: "€350",
    category: "Furniture",
    date: "16 Apr 2026",
    status: "pending",
    views: 0,
    likes: 0,
    image: "https://images.unsplash.com/photo-1550254478-ead40cc54513?auto=format&fit=crop&q=80&w=400&h=300",
  },
  {
    id: "AD-09950",
    title: "Sony PlayStation 5 Console + 2 Games",
    price: "€400",
    category: "Gaming",
    date: "10 Mar 2026",
    status: "sold",
    views: 1250,
    likes: 89,
    image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&q=80&w=400&h=300",
  }
];

export default function MyAdsPage() {
  const [ads, setAds] = useState(initialAds);
  const [activeTab, setActiveTab] = useState('all');

  const filteredAds = ads.filter(ad => {
    if (activeTab === 'all') return true;
    return ad.status === activeTab;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-200">Active</span>;
      case 'pending':
        return <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-full border border-amber-200">Pending Review</span>;
      case 'sold':
        return <span className="bg-gray-100 text-gray-700 text-xs font-bold px-2.5 py-1 rounded-full border border-gray-200">Sold</span>;
      case 'expired':
        return <span className="bg-red-100 text-red-700 text-xs font-bold px-2.5 py-1 rounded-full border border-red-200">Expired</span>;
      default:
        return null;
    }
  };

  const deleteAd = (id) => {
    if (window.confirm('Are you sure you want to delete this ad?')) {
      setAds(ads.filter(ad => ad.id !== id));
    }
  };

  return (
    <main className="min-h-screen bg-[#F3F4F6] flex flex-col">
      <Navbar />
      
      <div className="flex-grow max-w-[1200px] w-full mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Ads</h1>
            <p className="text-gray-500 mt-2">Manage your listings, check views, and update statuses.</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link 
              href="/postadd" 
              className="inline-flex items-center bg-[#046BD2] hover:bg-[#035bb3] text-white px-5 py-2.5 rounded-lg font-semibold transition-colors shadow-sm"
            >
              <PlusCircle size={20} className="mr-2" />
              Post New Ad
            </Link>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex overflow-x-auto hide-scrollbar space-x-2 border-b border-gray-200 mb-6 pb-px">
          {['all', 'active', 'pending', 'sold', 'expired'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors capitalize ${
                activeTab === tab 
                  ? 'border-[#046BD2] text-[#046BD2]' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab === 'all' ? 'All Ads' : tab}
              <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-[11px]">
                {tab === 'all' ? ads.length : ads.filter(a => a.status === tab).length}
              </span>
            </button>
          ))}
        </div>

        {/* Ads Grid/List */}
        {filteredAds.length === 0 ? (
           <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 flex flex-col items-center justify-center text-center">
             <div className="bg-gray-50 p-5 rounded-full mb-4 text-gray-300">
               <Tag size={48} />
             </div>
             <h3 className="text-xl font-semibold text-gray-900 mb-2">No ads found</h3>
             <p className="text-gray-500 mb-6 max-w-md">You don't have any advertisements matching this status. Try posting a new ad to get started.</p>
             <Link 
               href="/postadd" 
               className="inline-flex items-center text-[#046BD2] bg-blue-50 hover:bg-blue-100 px-5 py-2.5 rounded-lg font-semibold transition-colors"
             >
               Post Your First Ad
             </Link>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAds.map((ad) => (
              <div key={ad.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
                {/* Image Area */}
                <div className="relative h-48 w-full bg-gray-200 overflow-hidden">
                  <img src={ad.image} alt={ad.title} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 left-3">
                    {getStatusBadge(ad.status)}
                  </div>
                  {/* Overlay Actions on Hover */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button className="bg-white text-gray-800 p-2.5 rounded-full hover:bg-[#046BD2] hover:text-white transition-colors" title="Edit">
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => deleteAd(ad.id)}
                      className="bg-white text-gray-800 p-2.5 rounded-full hover:bg-red-500 hover:text-white transition-colors" 
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Content Area */}
                <div className="p-5 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-[#046BD2] text-[20px] mb-1 flex-grow">{ad.price}</h3>
                    <button className="text-gray-400 hover:text-gray-700 transition-colors">
                      <MoreVertical size={20} />
                    </button>
                  </div>
                  <h4 className="text-[15px] font-semibold text-gray-800 line-clamp-2 mb-3 min-h-[44px]">
                    {ad.title}
                  </h4>
                  
                  {/* Meta Details */}
                  <div className="mt-auto space-y-3">
                    <div className="flex items-center text-[13px] text-gray-500 gap-2">
                      <Tag size={14} className="flex-shrink-0" />
                      <span className="truncate">{ad.category}</span>
                      <span className="mx-1">•</span>
                      <span className="truncate">Ref: {ad.id}</span>
                    </div>
                    <div className="flex justify-between items-center text-[13px] text-gray-500 border-t border-gray-100 pt-3 mt-3">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} />
                        <span>{ad.date}</span>
                      </div>
                      <div className="flex items-center space-x-3 font-medium">
                        <span className="flex items-center gap-1" title="Views">
                          <Eye size={14} /> {ad.views}
                        </span>
                        <span className="flex items-center gap-1 text-red-500" title="Favorites">
                          <Heart size={14} className="fill-red-50 text-red-500" /> {ad.likes}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Optional Footer Action */}
                {ad.status === 'active' && (
                  <div className="bg-blue-50/50 border-t border-blue-50 p-3">
                    <button className="w-full flex items-center justify-center py-2 text-sm font-semibold text-[#046BD2] hover:bg-[#046BD2] hover:text-white rounded-md bg-white border border-[#046BD2] transition-colors">
                      <Megaphone size={16} className="mr-2" />
                      Boost Ad Position
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
