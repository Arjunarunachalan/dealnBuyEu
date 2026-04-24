'use client';

import { Star, MapPin, Heart } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useWishlistStore } from '../../store/useWishlistStore';
import { useAuthStore } from '../../store/useAuthStore';

export default function ProductCard({ id, title, price, location, badge, rating, imageUrl }) {
  const router = useRouter();
  const { isWishlisted, toggle } = useWishlistStore();
  const { isLoggedIn } = useAuthStore();

  const isValidImage = imageUrl && typeof imageUrl === 'string' && !imageUrl.startsWith('blob:');
  const finalImageUrl = isValidImage ? imageUrl : 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=400';
  
  const displayTitle = title ? title.charAt(0).toUpperCase() + title.slice(1) : '';
  const displayLocation = location ? 
    location.split(/[\s,]+/).map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(', ') 
    : '';

  // Render stars
  const stars = [];
  for (let i = 0; i < 5; i++) {
    stars.push(
      <Star 
        key={i} 
        size={14} 
        className={i < rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"} 
      />
    );
  }

  // Badge styles
  let badgeColor = "bg-gray-500";
  if (badge === "Verified Seller") badgeColor = "bg-[#10B981]";
  if (badge === "Featured") badgeColor = "bg-[#3B82F6]";
  if (badge === "Recommended") badgeColor = "bg-[#F59E0B]";

  const productId = id || '123';
  const wishlisted = productId ? isWishlisted(productId) : false;

  const handleWishlistClick = (e) => {
    e.preventDefault();  // Prevent Link navigation
    e.stopPropagation();
    if (!isLoggedIn) {
      router.push('/registration_login');
      return;
    }
    toggle(productId);
  };

  return (
    <Link href={`/product/${productId}`} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow border border-gray-100 cursor-pointer flex flex-col h-full block group">
      {/* Image Container */}
      <div className="relative aspect-[4/3] bg-gray-100 flex-shrink-0">
        <div 
          className="w-full h-full bg-cover bg-center transition-transform group-hover:scale-105 duration-300"
          style={{ backgroundImage: `url('${finalImageUrl}')` }}
        />
        
        {badge && (
          <div className={`absolute top-2 left-2 px-2.5 py-1 text-[10px] font-bold text-white rounded-sm ${badgeColor}`}>
            {badge.toUpperCase()}
          </div>
        )}

        {/* Wishlist Heart Button */}
        <button
          id={`wishlist-card-${productId}`}
          onClick={handleWishlistClick}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
          className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-md border transition-all duration-200
            ${wishlisted
              ? 'bg-red-500 border-red-500 scale-110'
              : 'bg-white border-gray-200 opacity-0 group-hover:opacity-100 hover:border-red-300 hover:bg-red-50'
            }`}
        >
          <Heart
            size={15}
            className={wishlisted ? 'fill-white text-white' : 'text-gray-500 hover:text-red-500'}
          />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex items-center text-gray-500 text-[11px] mb-2 font-semibold tracking-wide">
          <MapPin size={12} className="mr-1" />
          {displayLocation}
        </div>
        
        <h4 className="font-semibold text-[#1A1A1A] text-[15px] leading-snug mb-3 line-clamp-2 min-h-[44px] group-hover:text-[#046BD2] transition-colors">
          {displayTitle}
        </h4>
        
        <div className="mt-auto">
          <div className="text-[#0066CC] font-bold text-xl mb-2">
            {price}
          </div>
          <div className="flex gap-0.5">
            {stars}
          </div>
        </div>
      </div>
    </Link>
  );
}

