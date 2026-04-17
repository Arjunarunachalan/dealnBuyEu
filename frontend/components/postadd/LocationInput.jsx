'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { MapPin, X, Loader2 } from 'lucide-react';

function getCookie(name) {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return m ? decodeURIComponent(m[1]) : null;
}

function getFallbackCountryCode() {
  const fromCookie = getCookie('country_market');
  const fromEnv = process.env.NEXT_PUBLIC_DEV_COUNTRY;
  return (fromCookie || fromEnv || 'fr').toLowerCase();
}

let _loadPromise = null;

function loadGoogleMaps() {
  if (typeof window === 'undefined') return Promise.resolve();

  if (window.google?.maps?.places?.AutocompleteService) {
    return Promise.resolve();
  }

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
        console.error('[LocationInput] NEXT_PUBLIC_GOOGLE_MAPS_KEY is missing in .env');
        reject(new Error('Missing Google Maps API key'));
        return;
      }

      window.__googleMapsReady2 = () => {
        delete window.__googleMapsReady2;
        resolve();
      };

      const s = document.createElement('script');
      s.id = SCRIPT_ID;
      s.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places&callback=__googleMapsReady2`;
      s.async = true;
      s.defer = true;
      s.onerror = () => {
        _loadPromise = null;
        reject(new Error('Google Maps script failed to load'));
      };
      document.head.appendChild(s);
    });
  }

  return _loadPromise;
}

const COUNTRY_MAP = {
  'france': 'fr',
  'spain': 'es',
  'portugal': 'pt'
};

export default function LocationInput({ id, value, onChange, placeholder = 'City, Neighborhood or Zip', countryCode, required }) {
  const [inputValue, setInputValue] = useState(value || '');
  const [predictions, setPredictions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const acService = useRef(null);
  const psService = useRef(null);
  const sessionToken = useRef(null);
  const debounceTimer = useRef(null);
  const containerRef = useRef(null);
  const dummyEl = useRef(null);
  const isMounted = useRef(true);

  // Keep internal input value in sync with external value if needed
  useEffect(() => {
    if (value !== undefined && !isFocused) {
      setInputValue(value);
    }
  }, [value, isFocused]);

  useEffect(() => {
    isMounted.current = true;

    loadGoogleMaps()
      .then(() => {
        if (!isMounted.current) return;
        const gp = window.google.maps.places;
        acService.current = new gp.AutocompleteService();
        
        if (!dummyEl.current) {
          dummyEl.current = document.createElement('div');
          dummyEl.current.style.display = 'none';
          document.body.appendChild(dummyEl.current);
        }
        psService.current = new gp.PlacesService(dummyEl.current);
        sessionToken.current = new gp.AutocompleteSessionToken();

        setIsReady(true);
      })
      .catch((err) => {
        console.error('[LocationInput] init failed:', err);
      });

    const onOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', onOutsideClick);

    return () => {
      isMounted.current = false;
      document.removeEventListener('mousedown', onOutsideClick);
      clearTimeout(debounceTimer.current);
      if (dummyEl.current?.parentNode) {
        dummyEl.current.parentNode.removeChild(dummyEl.current);
        dummyEl.current = null;
      }
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
      const requestParams = {
        input: query,
        sessionToken: sessionToken.current,
      };

      const finalCountryCode = countryCode || getFallbackCountryCode();
      
      if (finalCountryCode) {
        const normalized = finalCountryCode.toLowerCase();
        const isoCode = COUNTRY_MAP[normalized] || normalized;
        requestParams.componentRestrictions = { country: [isoCode] };
      }

      acService.current.getPlacePredictions(
        requestParams,
        (results, status) => {
          if (!isMounted.current) return;
          setIsLoading(false);

          if (status === 'OK' && Array.isArray(results) && results.length > 0) {
            setPredictions(results);
            setIsOpen(true);
          } else {
            setPredictions([]);
            setIsOpen(false);
          }
        }
      );
    }, 350);
  }, [countryCode]);

  const handleInputChange = (e) => {
    const v = e.target.value;
    setInputValue(v);
    onChange(v); // let parent know about raw text typed

    if (!v.trim()) {
      clearTimeout(debounceTimer.current);
      setIsLoading(false);
      setPredictions([]);
      setIsOpen(false);
      return;
    }
    fetchPredictions(v);
  };

  const handleSelect = useCallback(
    (pred) => {
      if (!psService.current) return;

      const mainText = pred.structured_formatting?.main_text || pred.description;
      setInputValue(mainText);
      setPredictions([]);
      setIsOpen(false);
      onChange(mainText); // Pass selected text back to parent
      
      // We could fetch details here if we strictly wanted coordinates or city,
      // but for this simple LocationInput we just need a formatted string
      // representing the chosen location to show in the form.

      const gp = window.google?.maps?.places;
      if (gp) {
        sessionToken.current = new gp.AutocompleteSessionToken();
      }
    },
    [onChange]
  );

  const handleKeyDown = (e) => {
    if (!isOpen || !predictions.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, predictions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      handleSelect(predictions[activeIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    setActiveIndex(-1);
  }, [predictions]);

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          id={id}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => {
            setIsFocused(true);
            if (predictions.length > 0) setIsOpen(true);
          }}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={isReady ? placeholder : 'Loading...'}
          className="w-full h-[48px] pl-10 pr-10 bg-[#EBEBEB] border-[0.8px] border-[rgba(149,149,149,0.52)] rounded-[5px] text-[14px] text-[#333333] focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#046BD2] transition-colors disabled:opacity-50"
          autoComplete="off"
          spellCheck={false}
          disabled={!isReady}
          required={required}
        />

        {isLoading && (
          <Loader2 size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />
        )}
        
        {inputValue && !isLoading && (
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              setInputValue('');
              onChange('');
              setPredictions([]);
              setIsOpen(false);
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {isOpen && predictions.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-[300px] overflow-y-auto">
          {predictions.map((pred, idx) => (
            <li
              key={pred.place_id}
              className={`flex items-start gap-3 px-4 py-3 cursor-pointer border-b border-gray-50 last:border-0 ${
                idx === activeIndex ? 'bg-blue-50' : 'hover:bg-gray-50'
              }`}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(pred);
              }}
              onMouseEnter={() => setActiveIndex(idx)}
            >
              <MapPin size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-[14px] text-gray-900 truncate font-medium">
                  {pred.structured_formatting?.main_text || pred.description}
                </span>
                {pred.structured_formatting?.secondary_text && (
                  <span className="text-[12px] text-gray-500 truncate mt-0.5">
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
