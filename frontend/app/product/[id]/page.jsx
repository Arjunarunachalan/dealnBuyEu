'use client';

import { useState, useRef, useEffect, use } from 'react';
import Link from 'next/link';
import { MapPin, MessageCircle, Share2, Flag, Navigation, ChevronLeft, ChevronRight, User, Link as LinkIcon } from 'lucide-react';
import Navbar from '../../../components/layout/Navbar';
import Footer from '../../../components/layout/Footer';

export default function ProductPage({ params }) {
  const resolvedParams = use(params);
  // Mock product data for display
  const product = {
    id: resolvedParams?.id || '123',
    name: 'Apple iPhone 15 Pro Max - 256GB - Natural Titanium',
    price: '₹ 1,35,000',
    description: `Selling my iPhone 15 Pro Max 256GB in Natural Titanium. 
    It is in pristine condition with 100% battery health. Bought it directly from Apple Store 2 months ago.
    Includes original box, unused charging cable, and a premium Spigen case. 
    No scratches or dents. Price is slightly negotiable for serious buyers.`,
    location: 'Kochi, Kerala',
    postedDate: '2 days ago',
    images: [
      'https://m.media-amazon.com/images/I/81Os1SDWpcL._AC_SL1500_.jpg',
      'https://m.media-amazon.com/images/I/61l9ppRIiqL._AC_SL1500_.jpg',
      'https://m.media-amazon.com/images/I/712CBkVhSqL._AC_SL1500_.jpg'
    ],
    seller: {
      id: 'seller123',
      name: 'Rahul Krishna',
      memberSince: 'Member since Jan 2023',
      avatar: null, // null will show fallback
      productsCount: 14
    },
    mapCoords: '9.931233,76.267303' // Mock coordinates for Kochi
  };

  const [activeImage, setActiveImage] = useState(0);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const shareMenuRef = useRef(null);

  const nextImage = () => {
    setActiveImage((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    setActiveImage((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
  };

  // Close share menu if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target)) {
        setShowShareMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : 'https://dealnbuy.com/product/123';
  
  const handleShare = (platform) => {
    switch (platform) {
      case 'whatsapp':
        window.open(`https://api.whatsapp.com/send?text=Check out this product on DealNBuy: ${shareUrl}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=Check out this product on DealNBuy: ${product.name}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard! You can paste it on Instagram or anywhere else.');
        break;
    }
    setShowShareMenu(false);
  };

  const handleReport = () => {
    // Placeholder for reporting logic or modal
    if(confirm("Are you sure you want to report this product?")) {
       alert("Product reported successfully. Our team will review it shortly.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex flex-col">
      <Navbar />
      
      <main className="flex-grow max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-6 flex flex-wrap gap-1">
          <Link href="/" className="hover:text-[#046BD2]">Home</Link> <span>/</span> 
          <span className="text-gray-700">Mobiles</span> <span>/</span> 
          <span className="text-gray-900 font-medium truncate">{product.name}</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* LEFT COLUMN: Product Images & Details */}
          <div className="w-full lg:w-[65%] flex flex-col gap-6">
            
            {/* Image Gallery */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              {/* Main Image */}
              <div className="relative h-[300px] sm:h-[400px] md:h-[500px] w-full bg-gray-50 flex items-center justify-center p-4">
                <img 
                  src={product.images[activeImage]} 
                  alt={product.name} 
                  className="max-h-full max-w-full object-contain mix-blend-multiply"
                />
                
                {/* Image Navigation */}
                <button 
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft size={24} className="text-gray-800" />
                </button>
                <button 
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-gray-50 transition-colors"
                >
                  <ChevronRight size={24} className="text-gray-800" />
                </button>
              </div>
              
              {/* Thumbnails */}
              <div className="flex p-4 gap-4 overflow-x-auto bg-gray-50 border-t border-gray-100">
                {product.images.map((img, idx) => (
                  <div 
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`h-20 w-20 bg-white flex-shrink-0 cursor-pointer rounded border-2 overflow-hidden transition-all ${activeImage === idx ? 'border-[#046BD2] shadow-sm' : 'border-transparent hover:border-gray-300'}`}
                  >
                    <img src={img} alt="thumbnail" className="h-full w-full object-contain p-1" />
                  </div>
                ))}
              </div>
            </div>

            {/* Product Info Block */}
            <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 border border-gray-100 relative">
              <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-6">
                <div className="flex-1">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 leading-tight">{product.name}</h1>
                  <p className="text-[#046BD2] text-3xl sm:text-4xl font-extrabold tracking-tight">{product.price}</p>
                </div>
                
                {/* Actions: Share & Report */}
                <div className="flex gap-6 text-gray-500 shrink-0">
                  <div className="relative" ref={shareMenuRef}>
                    <button 
                      onClick={() => setShowShareMenu(!showShareMenu)}
                      className="flex flex-col items-center hover:text-[#046BD2] transition-colors group" 
                      title="Share"
                    >
                      <div className="bg-gray-50 p-3 rounded-full group-hover:bg-blue-50 transition-colors mb-1">
                        <Share2 size={22} className="text-gray-700 group-hover:text-[#046BD2]" />
                      </div>
                      <span className="text-[13px] font-medium text-gray-600">Share</span>
                    </button>
                    
                    {/* Share Dropdown */}
                    {showShareMenu && (
                      <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-xl border border-gray-100 w-48 z-50 overflow-hidden transform origin-top-right transition-all">
                        <div className="p-2 space-y-1">
                          <button onClick={() => handleShare('whatsapp')} className="w-full text-left px-4 py-2.5 hover:bg-[#25D366] hover:text-white rounded-md transition-colors flex items-center text-sm font-medium">
                            {/* Simple Whatsapp SVG since Lucide lacks it */}
                            <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 0C5.405 0 0 5.403 0 12.029c0 2.122.553 4.195 1.605 6.01L.065 23.518l5.632-1.477A12.052 12.052 0 0012.031 24c6.626 0 12.03-5.405 12.03-12.03C24.061 5.403 18.657 0 12.031 0zm6.545 17.182c-.276.779-1.613 1.503-2.227 1.53-.585.025-1.348.163-4.256-1.042-3.522-1.458-5.83-5.06-6.004-5.292-.174-.234-1.433-1.91-1.433-3.64 0-1.731.898-2.585 1.217-2.923.319-.34.693-.424.924-.424.232 0 .463.003.655.013.203.012.474-.082.742.56.276.662.946 2.308 1.033 2.478.086.17.144.37.028.604-.116.234-.174.378-.348.583-.174.205-.366.452-.522.585-.174.135-.357.284-.16.621.196.337.868 1.432 1.865 2.322 1.285 1.146 2.357 1.498 2.674 1.649.319.15.506.128.694-.092.188-.22 0.81-.944 1.026-1.267.218-.323.433-.269.721-.16.29.109 1.81.854 2.112 1.004.303.15.505.226.578.351.072.126.072.732-.204 1.511z" /></svg>
                            WhatsApp
                          </button>
                          <button onClick={() => handleShare('facebook')} className="w-full text-left px-4 py-2.5 hover:bg-[#1877F2] hover:text-white rounded-md transition-colors flex items-center text-sm font-medium">
                            <svg className="w-[18px] h-[18px] mr-3" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> Facebook
                          </button>
                          <button onClick={() => handleShare('twitter')} className="w-full text-left px-4 py-2.5 hover:bg-[#000000] hover:text-white rounded-md transition-colors flex items-center text-sm font-medium">
                            <svg className="w-[18px] h-[18px] mr-3" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> Twitter
                          </button>
                          <button onClick={() => handleShare('copy')} className="w-full text-left px-4 py-2.5 hover:bg-gray-100 rounded-md transition-colors flex items-center text-sm font-medium text-gray-700">
                            <LinkIcon size={18} className="mr-3 text-gray-500" /> Copy Link
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <button 
                    onClick={handleReport}
                    className="flex flex-col items-center hover:text-red-500 transition-colors group" 
                    title="Report Ad"
                  >
                    <div className="bg-gray-50 p-3 rounded-full group-hover:bg-red-50 transition-colors mb-1">
                      <Flag size={22} className="text-gray-700 group-hover:text-red-500" />
                    </div>
                    <span className="text-[13px] font-medium text-gray-600">Report</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center text-sm text-gray-600 gap-y-2 gap-x-6 mb-8 py-4 border-y border-gray-100">
                <span className="flex items-center"><MapPin size={18} className="mr-2 text-gray-400" /> {product.location}</span>
                <span className="flex items-center"><span className="text-gray-400 mr-2">•</span> Posted {product.postedDate}</span>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-[20px] font-bold text-gray-900 mb-4 tracking-tight">Description</h3>
                <div className="text-gray-700 leading-relaxed text-[15.5px] whitespace-pre-line bg-gray-50/50 p-5 rounded-lg border border-gray-50">
                  {product.description}
                </div>
              </div>
            </div>
            
          </div>

          {/* RIGHT COLUMN: Seller Info & Actions */}
          <div className="w-full lg:w-[35%] flex flex-col gap-6">
            
            {/* Seller Card */}
            <div className="bg-white rounded-lg shadow-sm p-6 sm:p-7 border border-gray-100 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-5 tracking-tight border-b border-gray-100 pb-3">Seller Details</h3>
              
              <div className="flex items-center mb-6">
                <div className="h-[72px] w-[72px] bg-gray-100 border border-gray-200 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 mr-5 shadow-sm">
                  {product.seller.avatar ? (
                    <img src={product.seller.avatar} alt={product.seller.name} className="h-full w-full object-cover" />
                  ) : (
                    <User size={36} className="text-gray-400" />
                  )}
                </div>
                <div>
                  <p className="font-bold text-[19px] text-gray-900 leading-tight mb-1">{product.seller.name}</p>
                  <p className="text-[13px] font-medium text-gray-500">{product.seller.memberSince}</p>
                  <Link href={`/profile/${product.seller.id}`} className="text-[#046BD2] text-[14px] font-bold hover:underline flex items-center mt-2 decoration-2 underline-offset-2">
                    View profile & ({product.seller.productsCount}) ads
                  </Link>
                </div>
              </div>

              {/* Chat Button */}
              <button className="w-full bg-[#046BD2] hover:bg-[#035bb3] text-white font-bold py-3.5 px-4 rounded-lg shadow-md flex justify-center items-center transition-all hover:-translate-y-0.5">
                <MessageCircle size={22} className="mr-2.5" />
                Chat with Seller
              </button>
            </div>

            {/* Location & Map */}
            <div className="bg-white rounded-lg shadow-sm p-6 sm:p-7 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-5 tracking-tight border-b border-gray-100 pb-3">Ad Location</h3>
              <p className="flex items-center text-gray-700 font-medium mb-4 text-[15px]">
                <MapPin size={22} className="mr-2.5 text-[#046BD2]" />
                {product.location}
              </p>
              
              {/* Map Tile (Google Maps embed placeholder) */}
              <div className="w-full h-[220px] bg-gray-100 rounded-lg mb-5 overflow-hidden border border-gray-200 shadow-inner">
                <iframe 
                  title="map"
                  width="100%" 
                  height="100%" 
                  frameBorder="0" 
                  scrolling="no" 
                  marginHeight="0" 
                  marginWidth="0" 
                  src={`https://maps.google.com/maps?q=${product.mapCoords}&z=14&output=embed`}
                  className="brightness-[0.95] contrast-[1.05]"
                />
              </div>

              {/* Directions Button */}
              <a 
                href={`https://maps.google.com/maps?q=${product.mapCoords}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-white border-[2.5px] border-[#046BD2] text-[#046BD2] hover:bg-blue-50 font-bold py-3 px-4 rounded-lg flex justify-center items-center transition-colors shadow-sm"
              >
                <Navigation size={20} className="mr-2" />
                Get Directions
              </a>
            </div>

          </div>
          
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
