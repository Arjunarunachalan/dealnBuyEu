import { create } from 'zustand';

const STORAGE_KEY = 'location_data';

export const useLocationStore = create((set) => ({
  name: '',      // formatted_address (full display string)
  lat: null,
  lng: null,
  city: '',      // locality
  state: '',
  country: '',
  isSet: false,

  /** Called after a Google Places selection */
  setLocation: (locationData) => {
    const data = {
      name: locationData.name || '',
      lat: locationData.lat ?? null,
      lng: locationData.lng ?? null,
      city: locationData.city || '',
      state: locationData.state || '',
      country: locationData.country || '',
      isSet: true,
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    set(data);
  },

  /** Clear the location (e.g. user clicks "All") */
  clearLocation: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    set({ name: '', lat: null, lng: null, city: '', state: '', country: '', isSet: false });
  },

  /** Rehydrate from localStorage on client mount — SSR-safe */
  hydrate: () => {
    if (typeof window === 'undefined') return;

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw);
      set({ ...parsed, isSet: true });
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  },
}));
