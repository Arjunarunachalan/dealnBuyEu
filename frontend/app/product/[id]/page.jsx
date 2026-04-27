'use client';

import { useState, useRef, useEffect, use } from 'react';
import Link from 'next/link';
import { MapPin, MessageCircle, Share2, Flag, Navigation, ChevronLeft, ChevronRight, User, Link as LinkIcon, Loader2, Heart } from 'lucide-react';
import Navbar from '../../../components/layout/Navbar';
import Footer from '../../../components/layout/Footer';
import api from '../../../lib/axiosInstance';
import { useWishlistStore } from '../../../store/useWishlistStore';
import { useAuthStore } from '../../../store/useAuthStore';
import useChatStore from '../../../store/useChatStore';
import { useRouter } from 'next/navigation';

export default function ProductPage({ params }) {
  const resolvedParams = use(params);
  const postId = resolvedParams?.id;
  const router = useRouter();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [activeImage, setActiveImage] = useState(0);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const shareMenuRef = useRef(null);

  // Wishlist state
  const { isWishlisted, toggle: toggleWishlist, fetchWishlistIds, isFetched } = useWishlistStore();
  const { isLoggedIn, user: currentUser } = useAuthStore();
  const { startConversation } = useChatStore();
  const [isStartingChat, setIsStartingChat] = useState(false);
  const wishlisted = postId ? isWishlisted(postId) : false;

  // Derived: is this post owned by the current logged-in user?
  const isOwnPost = isLoggedIn && product && (
    (product.userId?._id || product.userId)?.toString() === currentUser?._id?.toString()
  );

  useEffect(() => {
    if (isLoggedIn && !isFetched) {
      fetchWishlistIds();
    }
  }, [isLoggedIn, isFetched, fetchWishlistIds]);

  useEffect(() => {
    if (!postId) return;
    const fetchPost = async () => {
      try {
        const { data } = await api.get(`/posts/${postId}`);
        setProduct(data?.data);
      } catch (err) {
        console.error("Failed to fetch product", err);
        setError("Failed to load product. It may have been removed or is unavailable in your region.");
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [postId]);

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
    if (!product) return;
    switch (platform) {
      case 'whatsapp':
        window.open(`https://api.whatsapp.com/send?text=Check out this product on DealNBuy: ${shareUrl}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent('Check out this product on DealNBuy: ' + product.title)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
        break;
    }
    setShowShareMenu(false);
  };

  const handleReport = () => {
    if(confirm("Are you sure you want to report this product?")) {
       alert("Product reported successfully. Our team will review it shortly.");
    }
  };

  const handleWishlistToggle = async () => {
    if (!isLoggedIn) {
      router.push('/registration_login');
      return;
    }
    await toggleWishlist(postId);
  };

  const handleStartChat = async () => {
    if (!isLoggedIn) {
      router.push('/registration_login');
      return;
    }
    
    if (isStartingChat) return;
    setIsStartingChat(true);
    
    try {
      const sellerId = product.userId?._id || product.userId;
      await startConversation(postId, sellerId);
      router.push('/messages');
    } catch (error) {
      console.error("Failed to start chat", error);
      alert("Could not start chat. Please try again.");
    } finally {
      setIsStartingChat(false);
    }
  };

  if (loading) {
     return (
       <div className="min-h-screen bg-[#F3F4F6] flex flex-col">
         <Navbar />
         <main className="flex-grow flex items-center justify-center">
            <Loader2 className="animate-spin text-[#046BD2]" size={42} />
         </main>
         <Footer />
       </div>
     );
  }

  if (error || !product) {
     return (
       <div className="min-h-screen bg-[#F3F4F6] flex flex-col">
         <Navbar />
         <main className="flex-grow flex flex-col items-center justify-center p-6 text-center">
            <Flag className="text-gray-400 mb-4" size={48} />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Item Unavailable</h2>
            <p className="text-gray-500 max-w-md">{error || "This item doesn't exist."}</p>
            <Link href="/" className="mt-6 px-6 py-2.5 bg-[#046BD2] text-white font-bold rounded-lg hover:bg-[#035bb3] transition-colors">
              Return Home
            </Link>
         </main>
         <Footer />
       </div>
     );
  }

  // Native Data Formatting
  const validImages = product.images?.filter(img => img && !img.startsWith('blob:')) || [];
  const displayImages = validImages.length > 0 ? validImages : ['https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=400'];
  
  const displayTitle = product.title ? product.title.charAt(0).toUpperCase() + product.title.slice(1) : 'Product';
  const displayPrice = `€ ${product.price.toLocaleString()}`;
  const displayLocation = product.location?.city ? product.location.city.charAt(0).toUpperCase() + product.location.city.slice(1).toLowerCase() : 'Local Pickup';
  const categoryName = product.categoryId?.name || 'Category';

  const sellerName = product.userId?.pseudoName || (product.userId?.name ? `${product.userId.name} ${product.userId.surname || ''}`.trim() : 'Unknown Seller');
  const sellerJoinedDate = product.userId?.createdAt ? new Date(product.userId.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Unknown';
  
  const mapCoords = product.location?.coordinates?.lat && product.location?.coordinates?.lng 
      ? `${product.location.coordinates.lat},${product.location.coordinates.lng}` 
      : '48.8566,2.3522'; // Paris fallback if missing maps

  const postedDateString = new Date(product.createdAt).toLocaleDateString();

  const nextImage = () => setActiveImage((prev) => (prev + 1) % displayImages.length);
  const prevImage = () => setActiveImage((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex flex-col">
      <Navbar />
      
      <main className="flex-grow max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* LEFT COLUMN: Product Images & Details */}
          <div className="w-full lg:w-[65%] flex flex-col gap-6">
            
            {/* Image Gallery */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              {/* Main Image */}
              <div className="relative h-[300px] sm:h-[400px] md:h-[500px] w-full bg-gray-50 flex items-center justify-center p-4">
                <img 
                  src={displayImages[activeImage]} 
                  alt={displayTitle} 
                  className="max-h-full max-w-full object-contain mix-blend-multiply"
                />
                
                {/* Image Navigation */}
                {displayImages.length > 1 && (
                  <>
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
                  </>
                )}
              </div>
              
              {/* Thumbnails */}
              {displayImages.length > 1 && (
                <div className="flex p-4 gap-4 overflow-x-auto bg-gray-50 border-t border-gray-100">
                  {displayImages.map((img, idx) => (
                    <div 
                      key={idx}
                      onClick={() => setActiveImage(idx)}
                      className={`h-20 w-20 bg-white flex-shrink-0 cursor-pointer rounded border-2 overflow-hidden transition-all ${activeImage === idx ? 'border-[#046BD2] shadow-sm' : 'border-transparent hover:border-gray-300'}`}
                    >
                      <img src={img} alt="thumbnail" className="h-full w-full object-contain p-1" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info Block */}
            <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 border border-gray-100 relative">
              <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-6">
                <div className="flex-1">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 leading-tight">{displayTitle}</h1>
                  <p className="text-[#046BD2] text-3xl sm:text-4xl font-extrabold tracking-tight">{displayPrice}</p>
                </div>
                
                {/* Actions: Save, Share & Report */}
                <div className="flex gap-6 text-gray-500 shrink-0">

                  {/* Wishlist / Save Button */}
                  <button
                    id="wishlist-toggle-btn"
                    onClick={handleWishlistToggle}
                    className="flex flex-col items-center transition-colors group"
                    title={wishlisted ? 'Remove from Wishlist' : 'Save to Wishlist'}
                  >
                    <div className={`p-3 rounded-full transition-colors mb-1 ${
                      wishlisted ? 'bg-red-50' : 'bg-gray-50 group-hover:bg-red-50'
                    }`}>
                      <Heart
                        size={22}
                        className={`transition-all duration-200 ${
                          wishlisted
                            ? 'text-red-500 fill-red-500 scale-110'
                            : 'text-gray-700 group-hover:text-red-500'
                        }`}
                      />
                    </div>
                    <span className={`text-[13px] font-medium ${
                      wishlisted ? 'text-red-500' : 'text-gray-600'
                    }`}>
                      {wishlisted ? 'Saved' : 'Save'}
                    </span>
                  </button>

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
                            <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 0C5.405 0 0 5.403 0 12.029c0 2.122.553 4.195 1.605 6.01L.065 23.518l5.632-1.477A12.052 12.052 0 0012.031 24c6.626 0 12.03-5.405 12.03-12.03C24.061 5.403 18.657 0 12.031 0zm6.545 17.182c-.276.779-1.613 1.503-2.227 1.53-.585.025-1.348.163-4.256-1.042-3.522-1.458-5.83-5.06-6.004-5.292-.174-.234-1.433-1.91-1.433-3.64 0-1.731.898-2.585 1.217-2.923.319-.34.693-.424.924-.424.232 0 .463.003.655.013.203.012.474-.082.742.56.276.662.946 2.308 1.033 2.478.086.17.144.37.028.604-.116.234-.174.378-.348.583-.174.205-.366.452-.522.585-.174.135-.357.284-.16.621.196.337.868 1.432 1.865 2.322 1.285 1.146 2.357 1.498 2.674 1.649.319.15.506.128.694-.092.188-.22 0.81-.944 1.026-1.267.218-.323.433-.269.721-.16.29.109 1.81.854 2.112 1.004.303.15.505.226.578.351.072.126.072.732-.204 1.511z" /></svg>
                            WhatsApp
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

              {/* Dynamic Attributes Grid */}
              {product.attributes && Object.keys(product.attributes).length > 0 && (
                 <div className="mb-6 p-4 bg-blue-50/50 rounded-lg border border-blue-100/50">
                    <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">Specifications</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-6 text-sm">
                       {Object.entries(product.attributes).map(([key, val]) => (
                          <div key={key} className="flex flex-col">
                             <span className="text-gray-500 capitalize">{key.replace('_', ' ')}</span>
                             <span className="font-semibold text-gray-900 capitalize">{Array.isArray(val) ? val.join(', ') : val}</span>
                          </div>
                       ))}
                    </div>
                 </div>
              )}

              <div className="flex flex-wrap items-center text-sm text-gray-600 gap-y-2 gap-x-6 mb-8 py-4 border-y border-gray-100">
                <span className="flex items-center"><MapPin size={18} className="mr-2 text-gray-400" /> {displayLocation}</span>
                <span className="flex items-center"><span className="text-gray-400 mr-2">•</span> Posted {postedDateString}</span>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-[20px] font-bold text-gray-900 mb-4 tracking-tight">Description</h3>
                <div className="text-gray-700 leading-relaxed text-[15.5px] whitespace-pre-line bg-gray-50/50 p-5 rounded-lg border border-gray-50">
                  {product.description || "No description provided."}
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
                  {product.userId?.avatar ? (
                    <img src={product.userId.avatar} alt={sellerName} className="h-full w-full object-cover" />
                  ) : (
                    <User size={36} className="text-gray-400" />
                  )}
                </div>
                <div>
                  <p className="font-bold text-[19px] text-gray-900 leading-tight mb-1">{sellerName}</p>
                  <p className="text-[13px] font-medium text-gray-500">Member since {sellerJoinedDate}</p>
                  <Link href={`/profile/${product.userId?._id}`} className="text-[#046BD2] text-[14px] font-bold hover:underline flex items-center mt-2 decoration-2 underline-offset-2">
                    View profile {product.sellerProductsCount ? `& (${product.sellerProductsCount}) ads` : ''}
                  </Link>
                </div>
              </div>

              {/* Chat / Edit Button */}
              {isOwnPost ? (
                <Link
                  href="/myads"
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3.5 px-4 rounded-lg flex justify-center items-center transition-all border border-gray-200"
                >
                  This is your ad
                </Link>
              ) : (
                <button 
                  onClick={handleStartChat}
                  disabled={isStartingChat}
                  className="w-full bg-[#046BD2] hover:bg-[#035bb3] text-white font-bold py-3.5 px-4 rounded-lg shadow-md flex justify-center items-center transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0"
                >
                  {isStartingChat ? (
                    <Loader2 size={22} className="mr-2.5 animate-spin" />
                  ) : (
                    <MessageCircle size={22} className="mr-2.5" />
                  )}
                  {isStartingChat ? 'Starting Chat...' : 'Chat with Seller'}
                </button>
              )}
            </div>

            {/* Location & Map */}
            <div className="bg-white rounded-lg shadow-sm p-6 sm:p-7 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-5 tracking-tight border-b border-gray-100 pb-3">Ad Location</h3>
              <p className="flex items-center text-gray-700 font-medium mb-4 text-[15px]">
                <MapPin size={22} className="mr-2.5 text-[#046BD2]" />
                {displayLocation}
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
                  src={`https://maps.google.com/maps?q=${mapCoords}&z=14&output=embed`}
                  className="brightness-[0.95] contrast-[1.05]"
                />
              </div>

              {/* Directions Button */}
              <a 
                href={`https://maps.google.com/maps?q=${mapCoords}`}
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
