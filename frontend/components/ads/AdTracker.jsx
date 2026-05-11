'use client';

import { useEffect, useRef, useState } from 'react';
import api from '../../lib/axiosInstance';
import { v4 as uuidv4 } from 'uuid'; // Fallback if no user

// Helper to get or create a session ID
const getOrCreateSessionId = () => {
  if (typeof window === 'undefined') return '';
  let sid = localStorage.getItem('ad_session_id');
  if (!sid) {
    sid = uuidv4();
    localStorage.setItem('ad_session_id', sid);
  }
  return sid;
};

export default function AdTracker({ ad, placement, children }) {
  const containerRef = useRef(null);
  const timerRef = useRef(null);
  const [hasTracked, setHasTracked] = useState(false);
  const lastInteractionTime = useRef(Date.now());

  // Track user interaction to ensure they are active
  useEffect(() => {
    const handleInteraction = () => {
      lastInteractionTime.current = Date.now();
    };

    window.addEventListener('mousemove', handleInteraction);
    window.addEventListener('scroll', handleInteraction);
    window.addEventListener('click', handleInteraction);
    window.addEventListener('keydown', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);

    return () => {
      window.removeEventListener('mousemove', handleInteraction);
      window.removeEventListener('scroll', handleInteraction);
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
  }, []);

  useEffect(() => {
    if (!ad || hasTracked) return;

    const sessionId = getOrCreateSessionId();

    const trackImpression = async () => {
      try {
        await api.post('/ads/track-impression', {
          adId: ad._id,
          sessionId,
          placement
        });
        setHasTracked(true);
      } catch (error) {
        console.error('Failed to track impression', error);
      }
    };

    const handleIntersect = (entries) => {
      const entry = entries[0];
      
      // Clear timer immediately if hidden or not meeting threshold
      if (!entry.isIntersecting || entry.intersectionRatio < 0.5) {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
        return;
      }

      // If we are already running a timer, don't start a new one
      if (timerRef.current) return;

      // Start the 1.5s visibility timer
      timerRef.current = setTimeout(() => {
        // Verify conditions before tracking
        const isTabActive = document.visibilityState === 'visible';
        
        // Ensure user interacted in the last 30 seconds
        const isUserActive = (Date.now() - lastInteractionTime.current) < 30000;

        if (isTabActive && isUserActive) {
          trackImpression();
        } else {
          // Reset timer if conditions weren't met, let it retry on next movement
          timerRef.current = null;
        }
      }, 1500);
    };

    const observer = new IntersectionObserver(handleIntersect, {
      root: null,
      rootMargin: '0px',
      threshold: 0.5 // 50% visibility required
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    // Also handle tab visibility changes to pause timers if they switch tabs
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (containerRef.current) observer.unobserve(containerRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      observer.disconnect();
    };
  }, [ad, hasTracked, placement]);

  return (
    <div ref={containerRef} className="sponsored-card w-full h-full">
      {children}
    </div>
  );
}
