'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Heart, Trash2, MapPin, ArrowRight, ShoppingBag, Loader2, Tag } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { useAuth } from '../../lib/useAuth';
import { useWishlistStore } from '../../store/useWishlistStore';

export default function WishlistPage() {
  const { isChecking, isLoggedIn } = useAuth(true); // Require auth
  const { wishlistItems, isLoading, fetchWishlistItems, toggle, wishlistIds } = useWishlistStore();

  useEffect(() => {
    if (isLoggedIn) {
      fetchWishlistItems();
    }
  }, [isLoggedIn, fetchWishlistItems]);

  const handleRemove = async (postId) => {
    await toggle(postId);
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-EU', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(price);

  const getImage = (post) => {
    const valid = post.images?.filter((img) => img && !img.startsWith('blob:'));
    return valid?.length > 0
      ? valid[0]
      : 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?auto=format&fit=crop&w=400&q=80';
  };

  const getLocation = (post) =>
    post.location?.city
      ? post.location.city.charAt(0).toUpperCase() + post.location.city.slice(1).toLowerCase()
      : 'Local Pickup';

  // Show skeleton loader while checking auth or loading wishlist
  if (isChecking || isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-[#046BD2]" size={40} />
            <p className="text-gray-500 font-medium">Loading your wishlist...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <Navbar />

      <main className="flex-grow max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">

        {/* Page Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-red-50 rounded-xl border border-red-100">
              <Heart size={22} className="text-red-500 fill-red-500" />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Wishlist</h1>
          </div>
          <p className="text-gray-500 ml-[52px]">
            {wishlistItems.length > 0
              ? `${wishlistItems.length} saved ${wishlistItems.length === 1 ? 'item' : 'items'}`
              : 'Items you save will appear here'}
          </p>
        </div>

        {/* Empty State */}
        {wishlistItems.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="relative mb-8">
              <div className="w-32 h-32 bg-gradient-to-br from-red-50 to-pink-100 rounded-full flex items-center justify-center shadow-inner border border-red-100">
                <Heart size={52} className="text-red-300" strokeWidth={1.5} />
              </div>
              <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center border border-blue-100">
                <ShoppingBag size={20} className="text-[#046BD2]" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Your wishlist is empty</h2>
            <p className="text-gray-500 max-w-sm mb-8 leading-relaxed">
              Browse listings and tap the heart icon to save your favourite deals. They&apos;ll show up right here.
            </p>
            <Link
              href="/"
              id="explore-btn"
              className="inline-flex items-center gap-2 bg-[#046BD2] hover:bg-[#035bb3] text-white font-bold px-8 py-3.5 rounded-xl shadow-md shadow-blue-500/20 transition-all hover:-translate-y-0.5"
            >
              Explore Listings <ArrowRight size={18} />
            </Link>
          </div>
        )}

        {/* Wishlist Grid */}
        {wishlistItems.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {wishlistItems.map((post) => (
              <div
                key={post._id}
                className="group bg-white rounded-2xl border border-gray-100 shadow-[0_2px_16px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_32px_rgb(0,0,0,0.10)] transition-all duration-300 overflow-hidden flex flex-col"
              >
                {/* Image */}
                <Link href={`/product/${post._id}`} id={`wishlist-item-${post._id}`} className="block relative overflow-hidden bg-gray-50 h-[200px]">
                  <img
                    src={getImage(post)}
                    alt={post.title}
                    className="w-full h-full object-contain p-4 mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Remove button — overlaid on image */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleRemove(post._id);
                    }}
                    title="Remove from wishlist"
                    id={`remove-wishlist-${post._id}`}
                    className="absolute top-3 right-3 w-9 h-9 bg-white rounded-full shadow-md flex items-center justify-center border border-gray-100 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-50 hover:border-red-200"
                  >
                    <Trash2 size={15} className="text-red-500" />
                  </button>
                </Link>

                {/* Body */}
                <div className="p-4 flex flex-col flex-grow">
                  <Link href={`/product/${post._id}`}>
                    <h3 className="font-bold text-gray-900 text-[15px] leading-snug mb-1.5 line-clamp-2 hover:text-[#046BD2] transition-colors">
                      {post.title}
                    </h3>
                  </Link>

                  <p className="text-[#046BD2] font-extrabold text-xl mb-3 tracking-tight">
                    {formatPrice(post.price)}
                  </p>

                  <div className="mt-auto space-y-1.5">
                    <div className="flex items-center text-gray-400 text-[13px]">
                      <MapPin size={13} className="mr-1.5 flex-shrink-0" />
                      <span className="truncate">{getLocation(post)}</span>
                    </div>
                    {post.categoryId?.name && (
                      <div className="flex items-center text-gray-400 text-[13px]">
                        <Tag size={13} className="mr-1.5 flex-shrink-0" />
                        <span className="truncate">{post.categoryId.name}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="px-4 pb-4 flex items-center justify-between gap-2 pt-3 border-t border-gray-50">
                  <Link
                    href={`/product/${post._id}`}
                    className="flex-1 bg-[#046BD2] hover:bg-[#035bb3] text-white font-bold text-[13px] py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all"
                  >
                    View Ad <ArrowRight size={14} />
                  </Link>
                  <button
                    onClick={() => handleRemove(post._id)}
                    title="Remove from wishlist"
                    className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-red-50 hover:border-red-200 transition-colors"
                  >
                    <Heart size={16} className="fill-red-500 text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
