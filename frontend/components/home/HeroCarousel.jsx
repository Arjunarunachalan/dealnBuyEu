'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';

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

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  // Auto-advance
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [currentSlide]);

  return (
    <div className="relative w-full h-[300px] md:h-[400px] overflow-hidden group">
      {/* Slides */}
      <div 
        className="flex transition-transform duration-500 ease-out h-full"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide) => (
          <div 
            key={slide.id}
            className={`flex-shrink-0 w-full h-full flex items-center justify-center ${slide.bgClass}`}
          >
            <div className="text-center px-4 md:px-20 max-w-[800px]">
              <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-4 drop-shadow-lg leading-tight uppercase">
                {slide.title}
              </h1>
              <p className="text-lg md:text-xl text-white/90 mb-8 font-medium">
                {slide.subtitle}
              </p>
              <button className="bg-white text-gray-900 font-bold px-8 py-3 rounded-full hover:bg-gray-100 hover:scale-105 transition-transform shadow-lg">
                {slide.buttonText}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <button 
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronLeft size={24} />
      </button>

      <button 
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronRight size={24} />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-y-1/2 -translate-x-1/2 flex space-x-2">
        {slides.map((_, idx) => (
          <button
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
