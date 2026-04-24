'use client';

import { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import api from '../../lib/axiosInstance';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useWishlistStore } from '../../store/useWishlistStore';

export default function ProductGrid() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isLoggedIn } = useAuthStore();
  const { fetchWishlistIds, isFetched } = useWishlistStore();

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const { data } = await api.get('/posts?limit=8');
        setPosts(data?.data?.posts || []);
      } catch (err) {
        console.error("Failed to fetch fresh posts", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLatest();
  }, []);

  // Hydrate wishlist IDs so card hearts show the correct saved state
  useEffect(() => {
    if (isLoggedIn && !isFetched) {
      fetchWishlistIds();
    }
  }, [isLoggedIn, isFetched, fetchWishlistIds]);


  return (
    <section className="w-full bg-[#F3F4F6] py-12">
      <div className="max-w-[1240px] mx-auto px-4">
        <h3 className="text-xl md:text-2xl font-bold text-[#1A1A1A] mb-8">
          Fresh Recommendations
        </h3>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-[#046BD2]" size={36} />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center bg-white border border-gray-100 rounded-lg py-16 px-4 shadow-sm text-gray-500 font-medium">
            No recent listings available yet in your local market. Check back soon.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {posts.map(post => (
              <ProductCard 
                key={post._id}
                id={post._id}
                title={post.title}
                price={`€ ${post.price.toLocaleString()}`}
                location={post.location?.city || 'Local Pickup'}
                badge={post.isFeatured ? "Featured" : ""}
                rating={5}
                imageUrl={post.images?.[0]}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
