'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../../lib/axiosInstance';
import AdTracker from '../ads/AdTracker';
import { useLocationStore } from '../../store/useLocationStore';

const slides = [
  {
    id: 1,
    title: 'BUY AND SELL SECOND HAND PRODUCTS',
    subtitle: 'Best deals on used cars, bikes, and electronics',
    bgClass: 'bg-gradient-to-r from-[#046BD2] to-[#035bb3]',
    buttonText: 'Start Exploring'
  },
  {
    id: 2,
    title: 'POST YOUR FREE AD TODAY!',
    subtitle: 'Reach thousands of buyers in your city instantly.',
    bgClass: 'bg-gradient-to-r from-[#FFCE00] to-[#e6bb00]',
    buttonText: 'Post Now'
  },
  {
    id: 3,
    title: 'UPGRADE YOUR RIDE',
    subtitle: 'Find verified and inspected used cars near you.',
    bgClass: 'bg-gradient-to-r from-[#333333] to-[#1a1a1a]',
    buttonText: 'View Cars'
  }
];

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [dynamicSlides, setDynamicSlides] = useState([...slides]);

  // Get user location for geospatial ad targeting
  const userLat = useLocationStore(state => state.lat);
  const userLng = useLocationStore(state => state.lng);
  const locationIsSet = useLocationStore(state => state.isSet);

  useEffect(() => {
    // Only fetch ads when we have a confirmed user location.
    // If no location is set, don't show geo-targeted ads at all.
    if (!locationIsSet || userLat == null || userLng == null) {
      // Reset to default slides when location cleared
      setDynamicSlides([...slides]);
      setCurrentSlide(0);
      return;
    }

    const fetchAds = async () => {
      try {
        const payload = { placement: 'homepage', count: 5, userLat, userLng };
        const { data } = await api.post('/ads/fetch', payload);
        if (data?.data && data.data.length > 0) {
          const adSlides = data.data.map((ad, idx) => ({
            id: `ad-${ad._id}`,
            isAd: true,
            adData: ad,
            title: ad.title,
            subtitle: ad.description || 'Sponsored',
            bgClass: 'bg-gradient-to-r from-[#046BD2] to-[#035bb3]', // Default ad gradient
            buttonText: 'Learn More',
            url: ad.url,
            image: ad.images?.[0]
          }));
          // Mix ads and static slides or just use ads
          setDynamicSlides([...adSlides, ...slides]);
          setCurrentSlide(0);
        } else {
          // No ads within radius — show only default slides
          setDynamicSlides([...slides]);
          setCurrentSlide(0);
        }
      } catch (err) {
        console.error("Failed to load ads", err);
      }
    };
    fetchAds();
  }, [userLat, userLng, locationIsSet]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === dynamicSlides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? dynamicSlides.length - 1 : prev - 1));
  };

  // Auto-advance
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [currentSlide, dynamicSlides.length]);

  return (
    <div className="relative w-full h-[300px] md:h-[400px] overflow-hidden group">
      {/* Slides */}
      <div 
        className="flex transition-transform duration-500 ease-out h-full"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {dynamicSlides.map((slide) => (
          <div 
            key={slide.id}
            className={`flex-shrink-0 w-full h-full relative ${slide.bgClass}`}
          >
            {slide.isAd ? (
              <AdTracker ad={slide.adData} placement="homepage">
                <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
                  {/* Optional background image for ad */}
                  {slide.image && (
                    <div className="absolute inset-0 z-0 opacity-40 mix-blend-overlay" style={{ backgroundImage: `url(${slide.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                  )}
                  <div className="text-center px-4 md:px-20 max-w-[800px] relative z-10">
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white/20 px-3 py-1 rounded-full text-xs font-bold text-white uppercase tracking-widest backdrop-blur-sm">Sponsored</div>
                    <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-4 drop-shadow-lg leading-tight uppercase">
                      {slide.title}
                    </h1>
                    <p className="text-lg md:text-xl text-white/90 mb-8 font-medium">
                      {slide.subtitle}
                    </p>
                    <a href={slide.url} target="_blank" rel="noopener noreferrer" className="inline-block bg-white text-gray-900 font-bold px-8 py-3 rounded-full hover:bg-gray-100 hover:scale-105 transition-transform shadow-lg">
                      {slide.buttonText}
                    </a>
                  </div>
                </div>
              </AdTracker>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center px-4 md:px-20 max-w-[800px]">
                  <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-4 drop-shadow-lg leading-tight uppercase">
                    {slide.title}
                  </h1>
                  <p className="text-lg md:text-xl text-white/90 mb-8 font-medium">
                    {slide.subtitle}
                  </p>
                  <button suppressHydrationWarning className="bg-white text-gray-900 font-bold px-8 py-3 rounded-full hover:bg-gray-100 hover:scale-105 transition-transform shadow-lg">
                    {slide.buttonText}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Controls */}
      <button suppressHydrationWarning
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronLeft size={24} />
      </button>

      <button suppressHydrationWarning
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronRight size={24} />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-y-1/2 -translate-x-1/2 flex space-x-2">
        {dynamicSlides.map((_, idx) => (
          <button suppressHydrationWarning
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`w-3 h-3 rounded-full transition-colors ${
              currentSlide === idx ? 'bg-white' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
