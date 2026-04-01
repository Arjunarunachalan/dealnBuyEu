'use client';

import Link from 'next/link';
import { Search, MapPin, Bell, Menu, User, PlusCircle, MessageCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [locationSearch, setLocationSearch] = useState('');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('All India');
  const { user, isLoggedIn, logout, hydrate } = useAuthStore();

  useEffect(() => {
    // Initial client hydrate
    hydrate();

    // Listen to changes in other tabs
    const handleStorageChange = () => {
      hydrate();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [hydrate]);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  const getBgColor = (name) => {
    if (!name) return '#046BD2';
    const colors = ['#f56a00', '#7265e6', '#ffbf00', '#00a2ae', '#1890ff', '#52c41a', '#eb2f96'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const locations = [
    'All India', 'New Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune'
  ];

  const filteredLocations = locations.filter(loc => 
    loc.toLowerCase().includes(locationSearch.toLowerCase())
  );
  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-2xl font-bold text-[#046BD2]">
              DealNBuy
            </Link>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 items-center justify-center px-8">
            <div className="w-full max-w-2xl flex relative h-[44px]">
              {/* Location Select */}
              <div className="relative flex items-center bg-gray-50 border border-gray-300 rounded-l-md px-3 py-2 w-[160px] cursor-pointer hover:bg-gray-100 transition-colors z-20">
                <MapPin size={18} className="text-gray-500 mr-2 flex-shrink-0" />
                <input
                  type="text"
                  value={showLocationDropdown ? locationSearch : selectedLocation}
                  onChange={(e) => {
                    setLocationSearch(e.target.value);
                    setShowLocationDropdown(true);
                  }}
                  onFocus={() => {
                    setLocationSearch('');
                    setShowLocationDropdown(true);
                  }}
                  onBlur={() => {
                    // Delay hiding to allow click event on option to fire
                    setTimeout(() => setShowLocationDropdown(false), 200);
                  }}
                  placeholder="Search city..."
                  className="bg-transparent border-none text-[14px] text-gray-700 focus:outline-none focus:ring-0 w-full truncate"
                />
                
                {/* Autocomplete Dropdown */}
                {showLocationDropdown && (
                  <div className="absolute top-full left-0 w-full bg-white border border-gray-200 shadow-lg mt-1 rounded-md max-h-60 overflow-y-auto z-50">
                    {filteredLocations.length > 0 ? (
                      filteredLocations.map((loc, index) => (
                        <div
                          key={index}
                          className="px-4 py-2 text-sm text-gray-700 hover:bg-[#046BD2] hover:text-white cursor-pointer transition-colors"
                          onClick={() => {
                            setSelectedLocation(loc);
                            setLocationSearch('');
                            setShowLocationDropdown(false);
                          }}
                        >
                          {loc}
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-sm text-gray-500">No locations found</div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Search Input */}
              <div className="flex-1 relative">
                <input 
                  type="text" 
                  placeholder="Find Cars, Mobile Phones and more..." 
                  className="w-full h-full border-y border-gray-300 pl-4 pr-10 text-[15px] focus:outline-none focus:border-[#046BD2] focus:ring-1 focus:ring-[#046BD2]"
                />
              </div>

              {/* Search Button */}
              <button className="bg-[#046BD2] hover:bg-[#035bb3] text-white px-6 rounded-r-md transition-colors h-full flex items-center justify-center">
                <Search size={20} />
              </button>
            </div>
          </div>

          {/* Right Action Icons */}
          <div className="hidden md:flex items-center space-x-6">
            <button className="text-gray-600 hover:text-[#046BD2] transition-colors relative">
              <MessageCircle size={24} />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                1
              </span>
            </button>
            <button className="text-gray-600 hover:text-[#046BD2] transition-colors relative">
              <Bell size={24} />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                2
              </span>
            </button>
            {isLoggedIn ? (
              <div className="relative group cursor-pointer z-[100]">
                <div className="flex items-center text-gray-700 hover:text-[#046BD2] font-semibold transition-colors">
                  <div 
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center overflow-hidden text-white text-sm font-bold"
                    style={{ backgroundColor: getBgColor(user?.username) }}
                  >
                    {user?.profilePic ? (
                      <img src={user.profilePic} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      getInitials(user?.username)
                    )}
                  </div>
                </div>
                {/* Dropdown on hover */}
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 shadow-lg rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100]">
                  <div className="py-2">
                    <Link href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Profile</Link>
                    <Link href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Ads</Link>
                    <Link href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Messages</Link>
                    <Link href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Saved/Likes</Link>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button 
                      onClick={() => {
                        logout();
                      }} 
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link href="/registration_login" className="flex items-center text-gray-700 hover:text-[#046BD2] font-semibold transition-colors">
                <User size={22} className="mr-2" />
                Login
              </Link>
            )}
            <Link href="/postadd" className="flex items-center bg-white border-4 border-[#FFCE00] shadow-md rounded-full px-5 py-2 font-bold text-gray-800 hover:scale-105 transition-transform">
              <PlusCircle size={20} className="mr-2 text-[#046BD2]" />
              POST FREE AD
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-4">
            <Link href={isLoggedIn ? "#" : "/registration_login"} className="text-gray-700">
               {isLoggedIn ? (
                 <div 
                   className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center overflow-hidden text-white text-[11px] font-bold"
                   style={{ backgroundColor: getBgColor(user?.username) }}
                 >
                   {user?.profilePic ? (
                      <img src={user.profilePic} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      getInitials(user?.username)
                    )}
                 </div>
               ) : (
                 <User size={24} />
               )}
            </Link>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-gray-900 focus:outline-none"
            >
              <Menu size={28} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Search & Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 flex flex-col shadow-lg absolute w-full left-0 z-40">
          <div className="p-4 space-y-4 max-h-[calc(100vh-64px)] overflow-y-auto">
            {/* Location Select Mobile */}
            <div className="flex relative">
                <MapPin size={18} className="text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2 z-10" />
                <input
                  type="text"
                  value={showLocationDropdown ? locationSearch : selectedLocation}
                  onChange={(e) => {
                    setLocationSearch(e.target.value);
                    setShowLocationDropdown(true);
                  }}
                  onFocus={() => {
                    setLocationSearch('');
                    setShowLocationDropdown(true);
                  }}
                  onBlur={() => {
                    // Delay hiding to allow click event on option to fire
                    setTimeout(() => setShowLocationDropdown(false), 200);
                  }}
                  placeholder="Search city..."
                  className="w-full border border-gray-300 rounded-md pl-10 pr-4 py-2.5 text-[15px] focus:outline-none focus:border-[#046BD2] bg-gray-50"
                />
                
                {/* Autocomplete Dropdown */}
                {showLocationDropdown && (
                  <div className="absolute top-full left-0 w-full bg-white border border-gray-200 shadow-lg mt-1 rounded-md max-h-60 overflow-y-auto z-50">
                    {filteredLocations.length > 0 ? (
                      filteredLocations.map((loc, index) => (
                        <div
                          key={index}
                          className="px-4 py-2 text-sm text-gray-700 hover:bg-[#046BD2] hover:text-white cursor-pointer transition-colors"
                          onClick={() => {
                            setSelectedLocation(loc);
                            setLocationSearch('');
                            setShowLocationDropdown(false);
                          }}
                        >
                          {loc}
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-sm text-gray-500">No locations found</div>
                    )}
                  </div>
                )}
            </div>

            {/* General Search Mobile */}
            <div className="flex relative h-[44px]">
              <input 
                type="text" 
                placeholder="Find Cars, Mobile Phones..." 
                className="w-full h-full border border-gray-300 rounded-l-md pl-4 pr-10 text-[15px] focus:outline-none focus:border-[#046BD2]"
              />
              <button className="bg-[#046BD2] hover:bg-[#035bb3] text-white px-4 rounded-r-md transition-colors h-full flex items-center justify-center">
                <Search size={20} />
              </button>
            </div>
            
            {/* Quick Links Mobile */}
            <div className="border-t border-gray-100 pt-4 flex flex-col space-y-2">
              <Link href="#" className="flex items-center text-gray-700 p-2 sm:p-3 hover:bg-gray-50 rounded-md transition-colors">
                <MessageCircle size={22} className="mr-3 text-[#046BD2]" />
                <span className="flex-1 font-medium text-[15px]">Chats</span>
                <span className="bg-red-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">1</span>
              </Link>
              <Link href="#" className="flex items-center text-gray-700 p-2 sm:p-3 hover:bg-gray-50 rounded-md transition-colors">
                <Bell size={22} className="mr-3 text-[#046BD2]" />
                <span className="flex-1 font-medium text-[15px]">Notifications</span>
                <span className="bg-red-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">2</span>
              </Link>
              {isLoggedIn ? (
                <>
                  <Link href="#" className="flex items-center text-gray-700 p-2 sm:p-3 hover:bg-gray-50 rounded-md transition-colors">
                    <User size={22} className="mr-3 text-[#046BD2]" />
                    <span className="font-medium text-[15px]">My Profile</span>
                  </Link>
                  <Link href="#" className="flex items-center text-gray-700 p-2 sm:p-3 hover:bg-gray-50 rounded-md transition-colors">
                    <PlusCircle size={22} className="mr-3 text-[#046BD2]" />
                    <span className="font-medium text-[15px]">My Ads</span>
                  </Link>
                  <button 
                    onClick={() => {
                      logout();
                    }} 
                    className="flex w-full items-center text-red-600 p-2 sm:p-3 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    <User size={22} className="mr-3 text-red-600" />
                    <span className="font-medium text-[15px]">Logout</span>
                  </button>
                </>
              ) : (
                <Link href="/registration_login" className="flex items-center text-gray-700 p-2 sm:p-3 hover:bg-gray-50 rounded-md transition-colors">
                  <User size={22} className="mr-3 text-[#046BD2]" />
                  <span className="font-medium text-[15px]">Login / Register</span>
                </Link>
              )}
            </div>

            {/* Sell Button Mobile */}
            <div className="pt-2 pb-2">
              <Link href="/postadd" className="w-full flex justify-center items-center bg-white border-[3px] border-[#FFCE00] shadow-sm rounded-md px-5 py-3 font-bold text-gray-800 hover:bg-gray-50 transition-colors">
                <PlusCircle size={20} className="mr-2 text-[#046BD2]" />
                POST FREE AD
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
