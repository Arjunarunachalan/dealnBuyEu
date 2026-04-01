import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  accessToken: null,
  isLoggedIn: false,
  isChecking: true,

  // Login action to wrap setting token and updating state together
  login: (userData, token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', token);
      localStorage.setItem('user', JSON.stringify(userData));
    }
    set({ user: userData, accessToken: token, isLoggedIn: true });
  },

  // Logout action
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
    }
    set({ user: null, accessToken: null, isLoggedIn: false });
  },

  // Initialize/Hydrate store on client mount
  hydrate: () => {
    if (typeof window === 'undefined') return;
    
    const token = localStorage.getItem('accessToken');
    let parsedUser = null;

    if (token) {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          parsedUser = JSON.parse(savedUser);
        } catch (e) {
          console.error("Failed to parse user from localStorage");
        }
      }
    }

    set({
      user: parsedUser,
      accessToken: token || null,
      isLoggedIn: !!token,
      isChecking: false
    });
  }
}));
