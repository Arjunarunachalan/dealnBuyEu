'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { useAuthStore } from '../../store/useAuthStore';
import { useWishlistStore } from '../../store/useWishlistStore';
import { useRouter } from 'next/navigation';
import { 
  User, Heart, List, Star, Megaphone, Shield, Trash2, LogOut, Edit3, Camera, MapPin, Phone, Mail, CheckCircle2, ChevronRight, Save, X, ArrowRight, Tag, Loader2
} from 'lucide-react';
import Link from 'next/link';
import api from '../../lib/axiosInstance';
import ProfileLocationInput from '../../components/ui/ProfileLocationInput';
import toast from 'react-hot-toast';

const AddInterestSection = ({ user, login }) => {
  const [categories, setCategories] = useState([]);
  const [selectedIds, setSelectedIds] = useState(user?.interestedCategories || []);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user && user.interestedCategories) {
      setSelectedIds(user.interestedCategories);
    }
  }, [user]);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const { data } = await api.get('/categories');
        setCategories(data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCats();
  }, []);

  const toggleCategory = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put('/users/profile', { interestedCategories: selectedIds });
      if (res.data) {
        const accessToken = localStorage.getItem('accessToken') || useAuthStore.getState().accessToken;
        login(res.data, accessToken);
        toast.success("Interests saved successfully!");
      }
    } catch (err) {
      toast.error("Failed to save interests.");
    } finally {
      setSaving(false);
    }
  };

  const renderCategoryCheckbox = (cat, depth, isAncestorSelected) => {
    const isChecked = isAncestorSelected || selectedIds.includes(cat._id);
    return (
      <div key={cat._id} className={`flex items-center my-3 py-1 rounded px-2 ${isAncestorSelected ? 'opacity-70 bg-gray-50' : 'hover:bg-gray-100/50'}`} style={{ marginLeft: `${depth * 24}px` }}>
        <input 
          type="checkbox" 
          id={`cat-${cat._id}`}
          checked={isChecked} 
          disabled={isAncestorSelected}
          onChange={() => toggleCategory(cat._id)}
          className={`w-4 h-4 text-[#046BD2] bg-white border-gray-300 rounded focus:ring-[#046BD2] ${isAncestorSelected ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        />
        <label htmlFor={`cat-${cat._id}`} className={`ml-3 text-[15px] font-semibold text-gray-800 select-none ${isAncestorSelected ? 'cursor-not-allowed text-gray-500' : 'cursor-pointer'}`}>
          {cat.name}
          {isAncestorSelected && <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-[#046BD2] bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded">Included</span>}
        </label>
      </div>
    );
  };

  const renderCategoryTree = (cats, depth = 0, isAncestorSelected = false) => {
    return cats.map(cat => {
      const isSelected = selectedIds.includes(cat._id);
      const isCurrentOrAncestorSelected = isAncestorSelected || isSelected;
      return (
        <div key={cat._id}>
          {renderCategoryCheckbox(cat, depth, isAncestorSelected)}
          {cat.children && cat.children.length > 0 && renderCategoryTree(cat.children, depth + 1, isCurrentOrAncestorSelected)}
        </div>
      );
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgb(0,0,0,0.04)] border border-gray-100 p-6 md:p-10 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-400 to-teal-400"></div>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 border-b border-gray-100 pb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">My Interests</h2>
          <p className="text-gray-500 mt-1.5 text-sm">Select categories you are interested in. We'll notify you when new ads are posted.</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={saving || loading}
          className="flex items-center text-white bg-[#046BD2] hover:bg-[#035bb3] font-semibold px-5 py-2.5 rounded-xl transition-all duration-300 shadow-sm disabled:opacity-50 shrink-0"
        >
          {saving ? <Loader2 size={16} className="animate-spin mr-2.5" /> : <Save size={16} className="mr-2.5" />}
          {saving ? "Saving..." : "Save Interests"}
        </button>
      </div>

      <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-100 min-h-[300px] max-h-[600px] overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-40"><Loader2 className="animate-spin text-[#046BD2] mb-3" size={32} /><p className="text-sm text-gray-500 font-medium">Loading categories...</p></div>
        ) : categories.length === 0 ? (
          <div className="text-center p-10"><p className="text-gray-500 font-medium">No categories found.</p></div>
        ) : (
          <div className="space-y-1">
             {renderCategoryTree(categories)}
          </div>
        )}
      </div>
    </div>
  );
};

export default function ProfilePage() {
  const { user, isLoggedIn, isChecking, hydrate, logout, login } = useAuthStore();
  const { wishlistItems, isLoading: wishlistLoading, fetchWishlistItems, toggle: toggleWishlist, wishlistIds } = useWishlistStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    location: ''
  });

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Mock data to ensure stunning UI even if real user is missing certain fields
  const displayUser = user || {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 987 654 3210',
    location: 'London, UK',
    memberSince: 'October 2023',
    profilePic: null,
  };

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        location: user.location || ''
      });
    }
  }, [user]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const res = await api.put('/users/profile', formData);
      if (res.data) {
         // Update the local store so changes reflect everywhere
         const accessToken = localStorage.getItem('accessToken') || useAuthStore.getState().accessToken;
         login(res.data, accessToken);
         setIsEditing(false);
         toast.success("Profile updated successfully!");
      }
    } catch (err) {
      console.error("Failed to update profile", err);
      toast.error("Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/registration_login');
  };

  // Fetch wishlist items when wishlist tab is opened
  useEffect(() => {
    if (activeTab === 'wishlist' && isLoggedIn) {
      fetchWishlistItems();
    }
  }, [activeTab, isLoggedIn, fetchWishlistItems]);

  const tabs = [
    { id: 'profile', label: 'User Information', icon: <User size={18} /> },
    { id: 'wishlist', label: 'My Wishlist', icon: <Heart size={18} />, count: wishlistIds.size || null },
    { id: 'myads', label: 'My Ads', icon: <List size={18} /> },
    { id: 'ownAd', label: 'Own Advertisement', icon: <Megaphone size={18} /> },
    { id: 'addInterest', label: 'Add Interest', icon: <Star size={18} /> },
    { id: 'privacy', label: 'Privacy Settings', icon: <Shield size={18} /> },
  ];

  const renderTabContent = () => {
    switch(activeTab) {
      case 'profile':
        return (
          <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgb(0,0,0,0.04)] border border-gray-100 p-6 md:p-10 transition-shadow hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#046BD2] to-indigo-400"></div>
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 border-b border-gray-100 pb-6 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Personal Information</h2>
                <p className="text-gray-500 mt-1.5 text-sm">Manage your basic account details and contact info.</p>
              </div>
              
              {!isEditing ? (
                <button 
                  suppressHydrationWarning
                  onClick={() => setIsEditing(true)}
                  className="flex items-center text-[#046BD2] hover:text-white hover:bg-[#046BD2] font-semibold bg-blue-50 px-5 py-2.5 border border-blue-100 hover:border-[#046BD2] rounded-xl transition-all duration-300 shadow-sm"
                >
                  <Edit3 size={16} className="mr-2.5" /> Edit Profile
                </button>
              ) : (
                <div className="flex gap-3">
                  <button 
                    suppressHydrationWarning
                    onClick={() => setIsEditing(false)}
                    disabled={isSaving}
                    className="flex items-center text-gray-500 hover:text-gray-700 font-semibold bg-gray-50 px-4 py-2.5 border border-gray-200 rounded-xl transition-all duration-300"
                  >
                    <X size={16} className="mr-1.5" /> Cancel
                  </button>
                  <button 
                    suppressHydrationWarning
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="flex items-center text-white bg-[#046BD2] hover:bg-[#035bb3] font-semibold px-5 py-2.5 rounded-xl transition-all duration-300 shadow-sm disabled:opacity-50"
                  >
                    <Save size={16} className="mr-2.5" /> {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              <div className="space-y-7">
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Full Name</p>
                  {isEditing ? (
                    <div className="relative">
                       <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                       <input 
                         type="text"
                         value={formData.name}
                         onChange={(e) => setFormData({...formData, name: e.target.value})}
                         className="w-full pl-11 pr-4 py-3 bg-white border border-gray-300 font-medium text-lg rounded-xl focus:border-[#046BD2] focus:ring-1 focus:ring-[#046BD2] transition-colors outline-none"
                       />
                    </div>
                  ) : (
                    <div className="flex items-center text-gray-900 font-medium text-lg bg-gray-50 px-4 py-3 rounded-xl border border-gray-100">
                      <User size={18} className="mr-3 text-gray-400" />
                      {displayUser.name}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Email Address</p>
                  <div className="flex items-center justify-between text-gray-500 font-medium text-[15px] bg-gray-100 px-4 py-3 rounded-xl border border-gray-200 cursor-not-allowed">
                    <div className="flex items-center truncate mr-2">
                       <Mail size={18} className="mr-3 text-gray-400 flex-shrink-0" />
                       <span className="truncate">{displayUser.email}</span>
                    </div>
                    <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded shadow-sm uppercase flex items-center shrink-0">
                       <CheckCircle2 size={12} className="mr-1" /> Verified
                    </span>
                  </div>
                  {isEditing && <p className="text-xs text-gray-400 mt-2">Email address cannot be changed.</p>}
                </div>
              </div>

              <div className="space-y-7">
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Phone Number</p>
                  {isEditing ? (
                    <div className="relative">
                       <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                       <input 
                         type="text"
                         value={formData.phone}
                         placeholder="e.g. +1 234 567 8900"
                         onChange={(e) => setFormData({...formData, phone: e.target.value})}
                         className="w-full pl-11 pr-4 py-3 bg-white border border-gray-300 font-medium text-[15px] rounded-xl focus:border-[#046BD2] focus:ring-1 focus:ring-[#046BD2] transition-colors outline-none"
                       />
                    </div>
                  ) : (
                    <div className="flex items-center text-gray-900 font-medium text-[15px] bg-gray-50 px-4 py-3 rounded-xl border border-gray-100">
                      <Phone size={18} className="mr-3 text-gray-400" />
                      {displayUser.phone || 'Not provided'}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Location</p>
                  {isEditing ? (
                    <ProfileLocationInput 
                      value={formData.location}
                      onChange={(val) => setFormData({...formData, location: val})}
                    />
                  ) : (
                    <div className="flex items-center text-gray-900 font-medium text-[15px] bg-gray-50 px-4 py-3 rounded-xl border border-gray-100">
                      <MapPin size={18} className="mr-3 text-gray-400" />
                      {displayUser.location || 'Not set'}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Added a subtle stats section underneath */}
            <div className="mt-10 pt-6 border-t border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50/50 rounded-xl">
                 <p className="text-[11px] text-gray-500 uppercase font-bold tracking-wider mb-1">Active Ads</p>
                 <p className="text-xl font-bold text-[#046BD2]">12</p>
              </div>
              <div className="text-center p-4 bg-blue-50/50 rounded-xl">
                 <p className="text-[11px] text-gray-500 uppercase font-bold tracking-wider mb-1">Views</p>
                 <p className="text-xl font-bold text-[#046BD2]">1.2k</p>
              </div>
              <div className="text-center p-4 bg-blue-50/50 rounded-xl">
                 <p className="text-[11px] text-gray-500 uppercase font-bold tracking-wider mb-1">Saved</p>
                 <p className="text-xl font-bold text-[#046BD2]">8</p>
              </div>
              <div className="text-center p-4 bg-green-50/50 rounded-xl">
                 <p className="text-[11px] text-green-600 uppercase font-bold tracking-wider mb-1">Status</p>
                 <p className="text-xl font-bold text-green-600">Active</p>
              </div>
            </div>
          </div>
        );

      case 'wishlist':
        const formatPrice = (price) =>
          new Intl.NumberFormat('en-EU', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(price);
        const getImg = (post) => {
          const valid = post.images?.filter((img) => img && !img.startsWith('blob:'));
          return valid?.length > 0 ? valid[0] : 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?auto=format&fit=crop&w=400&q=80';
        };
        const getCity = (post) => post.location?.city
          ? post.location.city.charAt(0).toUpperCase() + post.location.city.slice(1).toLowerCase()
          : 'Local Pickup';

        return (
          <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgb(0,0,0,0.04)] border border-gray-100 p-6 md:p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-400 to-pink-400"></div>

            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">My Wishlist</h2>
                <p className="text-gray-500 mt-1 text-sm">
                  {wishlistItems.length > 0
                    ? `${wishlistItems.length} saved ${wishlistItems.length === 1 ? 'item' : 'items'}`
                    : 'Items you save will appear here'}
                </p>
              </div>
              {wishlistItems.length > 0 && (
                <Link
                  href="/wishlist"
                  className="flex items-center gap-1.5 text-[#046BD2] font-semibold text-sm hover:underline"
                >
                  View all <ArrowRight size={15} />
                </Link>
              )}
            </div>

            {/* Loading */}
            {wishlistLoading && (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="animate-spin text-[#046BD2]" size={32} />
              </div>
            )}

            {/* Empty State */}
            {!wishlistLoading && wishlistItems.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-5 border border-red-100">
                  <Heart size={36} className="text-red-300" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">No saved items yet</h3>
                <p className="text-gray-500 text-sm max-w-xs mb-6 leading-relaxed">
                  Browse listings and tap the heart icon to save your favourite deals.
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 bg-[#046BD2] hover:bg-[#035bb3] text-white font-bold px-6 py-2.5 rounded-xl shadow-sm transition-all"
                >
                  Explore Listings <ArrowRight size={16} />
                </Link>
              </div>
            )}

            {/* Grid */}
            {!wishlistLoading && wishlistItems.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {wishlistItems.map((post) => (
                  <div
                    key={post._id}
                    className="group rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col"
                  >
                    {/* Image */}
                    <Link href={`/product/${post._id}`} className="block h-[140px] bg-white flex items-center justify-center overflow-hidden">
                      <img
                        src={getImg(post)}
                        alt={post.title}
                        className="w-full h-full object-contain p-3 mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                      />
                    </Link>

                    {/* Body */}
                    <div className="p-3 flex flex-col flex-grow">
                      <Link href={`/product/${post._id}`}>
                        <h4 className="font-bold text-gray-900 text-[13px] leading-snug mb-1 line-clamp-2 hover:text-[#046BD2] transition-colors">
                          {post.title}
                        </h4>
                      </Link>
                      <p className="text-[#046BD2] font-extrabold text-base mb-2">{formatPrice(post.price)}</p>
                      <div className="flex items-center text-gray-400 text-[12px] mt-auto">
                        <MapPin size={11} className="mr-1 flex-shrink-0" />
                        <span className="truncate">{getCity(post)}</span>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="px-3 pb-3 flex gap-2">
                      <Link
                        href={`/product/${post._id}`}
                        className="flex-1 bg-[#046BD2] hover:bg-[#035bb3] text-white font-bold text-[12px] py-2 rounded-lg flex items-center justify-center gap-1 transition-colors"
                      >
                        View <ArrowRight size={12} />
                      </Link>
                      <button
                        onClick={() => toggleWishlist(post._id)}
                        title="Remove from wishlist"
                        className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-red-50 hover:border-red-200 transition-colors"
                      >
                        <Heart size={13} className="fill-red-500 text-red-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 'deleteAccount':
        return (
          <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgb(0,0,0,0.04)] border border-red-100 p-6 md:p-10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-red-500"></div>
            <div className="flex flex-col items-center text-center max-w-xl mx-auto">
               <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6 border border-red-100 text-red-500 shadow-sm">
                  <Trash2 size={28} />
               </div>
               <h2 className="text-3xl font-bold text-gray-900 mb-4">Delete Account</h2>
               <p className="text-gray-500 text-[15px] leading-relaxed mb-8">
                  Once you delete your account, there is no going back. Please be certain. All your data, active ads, messages, and saved interests will be permanently removed from our active servers.
               </p>
               
               <div className="bg-red-50/50 border border-red-100 p-5 rounded-2xl mb-8 w-full text-left">
                  <label className="flex items-start">
                     <input type="checkbox" className="mt-1 w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 focus:ring-2" />
                     <span className="ml-3 text-sm text-red-800 font-semibold leading-snug">
                        I confirm that I want to permanently delete my account and understand that this action cannot be undone.
                     </span>
                  </label>
               </div>

               <button className="bg-red-500 hover:bg-red-600 text-white font-bold py-3.5 px-8 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg w-full sm:w-auto transform hover:-translate-y-0.5 w-[300px]">
                  Permanently Delete
               </button>
            </div>
          </div>
        );
      
      case 'addInterest':
        return <AddInterestSection user={user} login={login} />;

      // Generic Empty State for Other Tabs
      default:
        const selectedTab = tabs.find(t => t.id === activeTab) || tabs[0];
        return (
          <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgb(0,0,0,0.04)] border border-gray-100 p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-[#046BD2] mb-6 shadow-inner">
               {React.cloneElement(selectedTab.icon, { size: 40 })}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">{selectedTab.label} Section</h2>
            <p className="text-gray-500 max-w-sm mb-8 text-[15px]">
               You currently don't have any items in your {selectedTab.label.toLowerCase()}. Explore our platform to add them here!
            </p>
            <button className="bg-[#046BD2] hover:bg-[#035bb3] text-white font-bold py-3 px-8 rounded-xl transition-colors shadow-md shadow-blue-500/20">
               Explore DealNBuy
            </button>
          </div>
        );
    }
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <Navbar />

      <div className="flex-grow max-w-[1200px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 z-10 relative">
        

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar */}
          <div className="w-full lg:w-[320px] flex-shrink-0 space-y-6">
            
            {/* User Profile Card */}
            <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 p-6 flex flex-col items-center text-center relative overflow-hidden">
               {/* Small decorative background header inside component */}
               <div className="absolute top-0 left-0 w-full h-16 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 z-0"></div>
               
               <div className="relative z-10 mt-4 mb-4">
                 <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#046BD2] to-indigo-500 flex items-center justify-center text-white text-3xl font-extrabold uppercase shadow-[0_8px_16px_rgb(4,107,210,0.3)] border-4 border-white cursor-pointer hover:scale-105 transition-transform duration-300">
                   {displayUser.name.charAt(0)}
                 </div>
                 <button className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md border border-gray-200 hover:bg-gray-50 text-[#046BD2] transition-colors">
                    <Camera size={14} className="stroke-[2.5px]" />
                 </button>
               </div>
               
               <div className="z-10 w-full">
                 <h3 className="text-xl font-bold text-gray-900 leading-tight mb-1">{displayUser.name}</h3>
                 <p className="text-[14px] text-gray-500 font-medium truncate px-4">{displayUser.email}</p>
                 <div className="mt-4 inline-flex items-center justify-center px-3 py-1 bg-blue-50 rounded-full border border-blue-100">
                    <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                    <span className="text-xs font-bold text-[#046BD2] uppercase tracking-wider">Online</span>
                 </div>
               </div>
            </div>

            {/* Navigation Menu */}
            <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 overflow-hidden">
              <div className="p-3 space-y-1">
                 {tabs.map((t) => (
                    <button 
                      key={t.id} 
                      onClick={() => setActiveTab(t.id)}
                      className={`w-full flex items-center px-4 py-3.5 rounded-xl transition-all duration-200 text-[15px] font-semibold group
                        ${activeTab === t.id 
                          ? 'bg-blue-50/80 text-[#046BD2]' 
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }
                      `}
                    >
                      <span className={`mr-3.5 transition-colors ${activeTab === t.id ? 'text-[#046BD2]' : 'text-gray-400 group-hover:text-gray-600'}`}>
                        {t.icon}
                      </span> 
                      <span className="flex-1 text-left">{t.label}</span>
                      {t.count > 0 && (
                        <span className="ml-auto bg-red-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                          {t.count}
                        </span>
                      )}
                    </button>
                 ))}
              </div>
              
              <div className="border-t border-gray-100 p-3 mt-1 space-y-1">
                <button 
                  className="w-full flex items-center px-4 py-3.5 rounded-xl transition-colors text-[15px] font-semibold text-gray-600 hover:bg-gray-50 hover:text-gray-900 group" 
                  onClick={handleLogout}
                >
                   <LogOut size={18} className="mr-3.5 text-gray-400 group-hover:text-gray-600" /> Logout
                </button>
                <button 
                  className={`w-full flex items-center px-4 py-3.5 rounded-xl transition-colors text-[15px] font-semibold group
                    ${activeTab === 'deleteAccount' ? 'bg-red-50 text-red-600' : 'text-red-500 hover:bg-red-50 hover:text-red-600'}
                  `}
                  onClick={() => setActiveTab('deleteAccount')}
                >
                   <Trash2 size={18} className="mr-3.5 opacity-80" /> Delete Account
                </button>
              </div>
            </div>
            
          </div>

          {/* Main Content Area */}
          <div className="w-full lg:flex-1">
            {renderTabContent()}
          </div>

        </div>
      </div>

      <Footer />
    </main>
  );
}
