'use client';

import { create } from 'zustand';
import api from '../lib/axiosInstance';

export const useWishlistStore = create((set, get) => ({
  // Set of post ID strings for O(1) lookup
  wishlistIds: new Set(),
  // Full post objects (populated) - used by the wishlist page
  wishlistItems: [],
  isLoading: false,
  isFetched: false,

  /**
   * isWishlisted
   * Fast O(1) check — used by heart buttons across the site.
   */
  isWishlisted: (postId) => get().wishlistIds.has(postId),

  /**
   * fetchWishlistIds
   * Lightweight initialisation: fetches only IDs from /wishlist/ids.
   * Called once on mount when the user is logged in.
   */
  fetchWishlistIds: async () => {
    if (get().isFetched) return; // Already hydrated
    try {
      const { data } = await api.get('/wishlist/ids');
      if (data?.success) {
        set({
          wishlistIds: new Set(data.data),
          isFetched: true,
        });
      }
    } catch (err) {
      // Silently fail — user may not be logged in
    }
  },

  /**
   * fetchWishlistItems
   * Fetches full populated items. Used by the wishlist page.
   */
  fetchWishlistItems: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/wishlist');
      if (data?.success) {
        const ids = new Set(data.data.map((item) => item._id));
        set({
          wishlistItems: data.data,
          wishlistIds: ids,
          isFetched: true,
          isLoading: false,
        });
      }
    } catch (err) {
      console.error('Failed to fetch wishlist:', err);
      set({ isLoading: false });
    }
  },

  /**
   * toggle
   * Adds or removes a post from the wishlist.
   * Optimistic UI — updates the Set immediately, rolls back on error.
   */
  toggle: async (postId) => {
    const { wishlistIds, wishlistItems } = get();
    const isCurrentlyWishlisted = wishlistIds.has(postId);

    // --- Optimistic update ---
    const newIds = new Set(wishlistIds);
    if (isCurrentlyWishlisted) {
      newIds.delete(postId);
    } else {
      newIds.add(postId);
    }
    set({
      wishlistIds: newIds,
      wishlistItems: isCurrentlyWishlisted
        ? wishlistItems.filter((item) => item._id !== postId)
        : wishlistItems,
    });

    try {
      if (isCurrentlyWishlisted) {
        await api.delete(`/wishlist/${postId}`);
      } else {
        await api.post(`/wishlist/${postId}`);
      }
    } catch (err) {
      // --- Roll back on error ---
      console.error('Wishlist toggle failed, rolling back:', err);
      set({ wishlistIds, wishlistItems });
    }
  },

  /**
   * reset
   * Called on logout to clear all wishlist state.
   */
  reset: () => {
    set({ wishlistIds: new Set(), wishlistItems: [], isFetched: false, isLoading: false });
  },
}));
