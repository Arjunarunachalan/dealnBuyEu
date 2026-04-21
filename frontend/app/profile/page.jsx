'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { useAuthStore } from '../../store/useAuthStore';
import { useRouter } from 'next/navigation';
import { 
  User, Heart, List, Star, Megaphone, Shield, Trash2, LogOut, Edit3, Camera, MapPin, Phone, Mail, CheckCircle2, ChevronRight, Save, X
} from 'lucide-react';
import Link from 'next/link';
import api from '../../lib/axiosInstance';
import ProfileLocationInput from '../../components/ui/ProfileLocationInput';

export default function ProfilePage() {
  const { user, isLoggedIn, isChecking, hydrate, logout, login } = useAuthStore();
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
      }
    } catch (err) {
      console.error("Failed to update profile", err);
      alert("Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/registration_login');
  };

  const tabs = [
    { id: 'profile', label: 'User Information', icon: <User size={18} /> },
    { id: 'wishlist', label: 'My Wishlist', icon: <Heart size={18} /> },
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
        
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-500 mb-8 font-medium">
          <Link href="/" className="hover:text-[#046BD2] transition-colors">Home</Link>
          <ChevronRight size={14} className="mx-2" />
          <span className="text-gray-900">My Account</span>
        </div>

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
                     {t.label}
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
