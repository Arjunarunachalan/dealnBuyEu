'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { MapPin, Loader2 } from 'lucide-react';

let _loadPromise = null;

function loadGoogleMaps() {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.google?.maps?.places?.AutocompleteService) return Promise.resolve();

  if (!_loadPromise) {
    _loadPromise = new Promise((resolve, reject) => {
      const SCRIPT_ID = 'gm-script';
      if (document.getElementById(SCRIPT_ID)) {
        const poll = setInterval(() => {
          if (window.google?.maps?.places?.AutocompleteService) {
            clearInterval(poll);
            resolve();
          }
        }, 100);
        return;
      }

      const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
      if (!key) {
        console.error('Missing Google Maps API key');
        reject(new Error('Missing Google Maps API key'));
        return;
      }

      window.__googleMapsReadyProfile = () => {
        delete window.__googleMapsReadyProfile;
        resolve();
      };

      const s = document.createElement('script');
      s.id = SCRIPT_ID;
      s.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places&callback=__googleMapsReadyProfile`;
      s.async = true;
      s.defer = true;
      s.onerror = () => {
        _loadPromise = null;
        reject(new Error('Google Maps Script failed'));
      };
      document.head.appendChild(s);
    });
  }
  return _loadPromise;
}

export default function ProfileLocationInput({ value, onChange }) {
  const [predictions, setPredictions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  const acService = useRef(null);
  const sessionToken = useRef(null);
  const debounceTimer = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    let active = true;
    loadGoogleMaps().then(() => {
      if (!active) return;
      const gp = window.google.maps.places;
      acService.current = new gp.AutocompleteService();
      sessionToken.current = new gp.AutocompleteSessionToken();
    }).catch(console.error);

    const onOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', onOutsideClick);

    return () => {
      active = false;
      document.removeEventListener('mousedown', onOutsideClick);
      clearTimeout(debounceTimer.current);
    };
  }, []);

  const fetchPredictions = useCallback((query) => {
    if (!acService.current || !query.trim()) {
      setPredictions([]);
      setIsOpen(false);
      return;
    }

    clearTimeout(debounceTimer.current);
    setIsLoading(true);

    debounceTimer.current = setTimeout(() => {
      acService.current.getPlacePredictions(
        {
          input: query,
          sessionToken: sessionToken.current,
          types: ['(regions)'], // matches cities/zip codes well
        },
        (results, status) => {
          setIsLoading(false);
          if (status === 'OK' && results) {
            setPredictions(results);
            setIsOpen(true);
          } else {
            setPredictions([]);
            setIsOpen(false);
          }
        }
      );
    }, 350);
  }, []);

  const handleInputChange = (e) => {
    const v = e.target.value;
    onChange(v);
    
    if (!v.trim()) {
      clearTimeout(debounceTimer.current);
      setIsLoading(false);
      setPredictions([]);
      setIsOpen(false);
      return;
    }
    fetchPredictions(v);
  };

  const handleSelect = (pred) => {
    const mainText = pred.structured_formatting?.main_text || pred.description;
    const secondaryText = pred.structured_formatting?.secondary_text || '';
    onChange(secondaryText ? `${mainText}, ${secondaryText}` : mainText);
    
    setPredictions([]);
    setIsOpen(false);
    
    // reset token
    if (window.google?.maps?.places) {
       sessionToken.current = new window.google.maps.places.AutocompleteSessionToken();
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
      <input 
        type="text"
        value={value}
        placeholder="Type location to see suggestions..."
        onChange={handleInputChange}
        onFocus={() => setIsFocused(true)}
        className="w-full pl-11 pr-10 py-3 bg-white border border-gray-300 font-medium text-[15px] rounded-xl focus:border-[#046BD2] focus:ring-1 focus:ring-[#046BD2] transition-colors outline-none"
        autoComplete="off"
      />
      
      {isLoading && (
        <Loader2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />
      )}

      {isOpen && predictions.length > 0 && isFocused && (
        <ul className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-100 shadow-xl rounded-xl overflow-hidden z-50 max-h-60 overflow-y-auto">
          {predictions.map((pred) => (
            <li 
              key={pred.place_id}
              onMouseDown={(e) => {
                e.preventDefault(); 
                handleSelect(pred);
              }}
              className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center border-b border-gray-50 last:border-0"
            >
              <MapPin size={16} className="text-[#046BD2] mr-3 flex-shrink-0" />
              <div className="flex flex-col overflow-hidden">
                <span className="text-[14px] font-semibold text-gray-800 truncate">
                  {pred.structured_formatting?.main_text || pred.description}
                </span>
                {pred.structured_formatting?.secondary_text && (
                  <span className="text-[12px] text-gray-500 truncate">
                    {pred.structured_formatting.secondary_text}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
