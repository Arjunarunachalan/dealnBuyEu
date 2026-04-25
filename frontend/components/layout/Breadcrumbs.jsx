'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import React from 'react';

export default function Breadcrumbs() {
  const pathname = usePathname();

  // Don't render breadcrumbs on home page
  if (pathname === '/') return null;

  // Split pathname into segments
  const segments = pathname.split('/').filter((segment) => segment !== '');

  // Helper to format segment names (e.g., 'myads' -> 'My Ads', 'terms-conditions' -> 'Terms Conditions')
  const formatSegmentName = (segment) => {
    const specialCases = {
      'myads': 'My Ads',
      'postadd': 'Post Ad',
      'wishlist': 'Wishlist',
      'registration_login': 'Login / Register',
      'profile': 'My Profile',
      'subscription': 'Subscriptions',
      'notifications': 'Notifications',
      'categories': 'All Categories',
      'category': 'Category',
      'product': 'Product'
    };

    if (specialCases[segment.toLowerCase()]) {
      return specialCases[segment.toLowerCase()];
    }

    // Default formatting: replace dashes with spaces and capitalize
    return segment
      .replace(/-/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <nav className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-3" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2 flex-wrap">
        <li>
          <Link href="/" className="text-gray-500 hover:text-[#046BD2] transition-colors flex items-center">
            <Home size={16} />
            <span className="sr-only">Home</span>
          </Link>
        </li>
        
        {segments.map((segment, index) => {
          const isLast = index === segments.length - 1;
          const href = `/${segments.slice(0, index + 1).join('/')}`;
          const name = formatSegmentName(segment);

          return (
            <React.Fragment key={href}>
              <li>
                <ChevronRight size={16} className="text-gray-400" />
              </li>
              <li>
                {isLast ? (
                  <span className="text-[#046BD2] font-semibold text-sm" aria-current="page">
                    {name}
                  </span>
                ) : (
                  <Link href={href} className="text-gray-500 hover:text-[#046BD2] transition-colors text-sm font-medium">
                    {name}
                  </Link>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
