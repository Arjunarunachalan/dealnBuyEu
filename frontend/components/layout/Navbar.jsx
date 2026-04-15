'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Search, MapPin, Bell, Menu, User, PlusCircle, MessageCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useLocationStore } from '../../store/useLocationStore';

// Load LocationSearch client-side only (Google Maps requires browser APIs)
const LocationSearch = dynamic(
  () => import('../location/LocationSearch'),
  { ssr: false, loading: () => <LocationPlaceholder /> }
);

/** Shown while LocationSearch hydrates */
function LocationPlaceholder() {
  return (
    <div className="flex items-center gap-2 w-full">
      <MapPin size={16} className="text-gray-400 flex-shrink-0" />
      <span className="text-[13px] text-gray-400">Loading…</span>
    </div>
  );
}

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isLoggedIn, logout, hydrate: hydrateAuth } = useAuthStore();
  const { name: locationName, isSet, hydrate: hydrateLocation } = useLocationStore();

  useEffect(() => {
    hydrateAuth();
    hydrateLocation();

    const handleStorageChange = () => {
      hydrateAuth();
      hydrateLocation();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [hydrateAuth, hydrateLocation]);

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
    return colors[Math.abs(hash) % colors.length];
  };

  /** Truncated display label for navbar chip */
  const locationLabel = isSet && locationName
    ? locationName.length > 22 ? locationName.slice(0, 20) + '…' : locationName
    : 'Location';

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
            {/* overflow-visible ensures the dropdown escapes the fixed-height row */}
            <div className="w-full max-w-2xl flex relative h-[44px] overflow-visible">

              {/* Location autocomplete */}
              <div className="relative flex items-center bg-gray-50 border border-gray-300 rounded-l-md px-3 py-2 w-[190px] z-[60] overflow-visible">
                <LocationSearch placeholder="Search city…" />
              </div>

              {/* Keyword search */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Find Cars, Mobile Phones and more..."
                  className="w-full h-full border-y border-gray-300 pl-4 pr-10 text-[15px] focus:outline-none focus:border-[#046BD2] focus:ring-1 focus:ring-[#046BD2]"
                />
              </div>

              {/* Search button */}
              <button className="bg-[#046BD2] hover:bg-[#035bb3] text-white px-6 rounded-r-md transition-colors h-full flex items-center justify-center">
                <Search size={20} />
              </button>
            </div>
          </div>

          {/* Right action icons */}
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
                    style={{ backgroundColor: getBgColor(user?.name) }}
                  >
                    {user?.profilePic ? (
                      <img src={user.profilePic} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      getInitials(user?.name)
                    )}
                  </div>
                </div>
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 shadow-lg rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100]">
                  <div className="py-2">
                    <Link href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Profile</Link>
                    <Link href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Ads</Link>
                    <Link href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Messages</Link>
                    <Link href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Saved/Likes</Link>
                    <div className="border-t border-gray-100 my-1" />
                    <button
                      onClick={logout}
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
            <Link href={isLoggedIn ? '#' : '/registration_login'} className="text-gray-700">
              {isLoggedIn ? (
                <div
                  className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center overflow-hidden text-white text-[11px] font-bold"
                  style={{ backgroundColor: getBgColor(user?.name) }}
                >
                  {user?.profilePic ? (
                    <img src={user.profilePic} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    getInitials(user?.name)
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

          {/* Location — outside scroll container so dropdown never clips */}
          <div className="px-4 pt-4 pb-0 overflow-visible">
            <div className="relative flex items-center bg-gray-50 border border-gray-300 rounded-md px-3 py-2.5 z-[60] overflow-visible">
              <LocationSearch placeholder="Search city…" />
            </div>
          </div>

          <div className="p-4 space-y-4 max-h-[calc(100vh-120px)] overflow-y-auto">

            {/* Keyword search — mobile */}
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

            {/* Selected location badge */}
            {isSet && (
              <div className="flex items-center gap-2 px-1 py-1">
                <MapPin size={13} className="text-[#046BD2] flex-shrink-0" />
                <span className="text-[13px] text-[#046BD2] font-medium truncate">{locationLabel}</span>
              </div>
            )}

            {/* Quick Links */}
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
                    onClick={logout}
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

            {/* Sell button — mobile */}
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
