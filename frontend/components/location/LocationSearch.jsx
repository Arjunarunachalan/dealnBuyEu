'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { MapPin, X, Loader2 } from 'lucide-react';
import { useLocationStore } from '../../store/useLocationStore';

// ── Helpers ──────────────────────────────────────────────────────────────────

function getCookie(name) {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return m ? decodeURIComponent(m[1]) : null;
}

function getComponent(comps, type) {
  return comps?.find((c) => c.types.includes(type))?.long_name ?? '';
}

function getCountryCode() {
  const fromCookie = getCookie('country_market');
  const fromEnv = process.env.NEXT_PUBLIC_DEV_COUNTRY;
  return (fromCookie || fromEnv || 'FR').toLowerCase();
}

// ── Google Maps loader (plain script tag — no library, React StrictMode safe) ─

let _loadPromise = null;

function loadGoogleMaps() {
  if (typeof window === 'undefined') return Promise.resolve();

  // Already loaded
  if (window.google?.maps?.places?.AutocompleteService) {
    return Promise.resolve();
  }

  if (!_loadPromise) {
    _loadPromise = new Promise((resolve, reject) => {
      const SCRIPT_ID = 'gm-script';

      // Script tag already in DOM — wait for it
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
        console.error('[LocationSearch] NEXT_PUBLIC_GOOGLE_MAPS_KEY is missing in .env');
        reject(new Error('Missing Google Maps API key'));
        return;
      }

      // Using callback= so we know exactly when the API is ready
      window.__googleMapsReady = () => {
        delete window.__googleMapsReady;
        resolve();
      };

      const s = document.createElement('script');
      s.id = SCRIPT_ID;
      s.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places&callback=__googleMapsReady`;
      s.async = true;
      s.defer = true;
      s.onerror = () => {
        _loadPromise = null; // allow retry
        reject(new Error('Google Maps script failed to load'));
      };
      document.head.appendChild(s);
    });
  }

  return _loadPromise;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function LocationSearch({ placeholder = 'Search city…', onSelect }) {
  const { name: storedName, setLocation, clearLocation, isSet } = useLocationStore();

  const [inputValue, setInputValue] = useState('');
  const [predictions, setPredictions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const acService = useRef(null);   // AutocompleteService
  const psService = useRef(null);   // PlacesService
  const sessionToken = useRef(null);
  const debounceTimer = useRef(null);
  const containerRef = useRef(null);
  const dummyEl = useRef(null);
  const isMounted = useRef(true);

  // ── Init Google services ────────────────────────────────────────────────
  useEffect(() => {
    isMounted.current = true;

    loadGoogleMaps()
      .then(() => {
        if (!isMounted.current) return;

        const gp = window.google.maps.places;

        acService.current = new gp.AutocompleteService();

        // PlacesService needs an element — append off-screen div
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
        console.error('[LocationSearch] init failed:', err);
      });

    // Close dropdown on outside click
    const onOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setIsFocused(false);
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

  // ── Fetch predictions (debounced 350ms) ─────────────────────────────────
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
          componentRestrictions: { country: getCountryCode() },
          types: ['(cities)'],
        },
        (results, status) => {
          if (!isMounted.current) return;
          setIsLoading(false);

          if (status === 'OK' && Array.isArray(results) && results.length > 0) {
            setPredictions(results);
            setIsOpen(true);
          } else {
            if (status !== 'ZERO_RESULTS') {
              console.error('[LocationSearch] AutocompleteService status:', status);
            }
            setPredictions([]);
            setIsOpen(false);
          }
        }
      );
    }, 350);
  }, []);

  // ── Handle typing ────────────────────────────────────────────────────────
  const handleInputChange = (e) => {
    const v = e.target.value;
    setInputValue(v);
    if (!v.trim()) {
      clearTimeout(debounceTimer.current);
      setIsLoading(false);
      setPredictions([]);
      setIsOpen(false);
      return;
    }
    fetchPredictions(v);
  };

  // ── Select a suggestion → fetch details ──────────────────────────────────
  const handleSelect = useCallback(
    (pred) => {
      if (!psService.current) {
        console.error('[LocationSearch] PlacesService not ready');
        return;
      }

      const mainText = pred.structured_formatting?.main_text || pred.description;
      setInputValue('');
      setPredictions([]);
      setIsOpen(false);
      setIsLoading(true);

      psService.current.getDetails(
        {
          placeId: pred.place_id,
          sessionToken: sessionToken.current,
          fields: ['geometry', 'formatted_address', 'address_components'],
        },
        (place, status) => {
          if (!isMounted.current) return;
          setIsLoading(false);

          if (status !== 'OK' || !place) {
            console.error('[LocationSearch] getDetails status:', status);
            return;
          }

          const comps = place.address_components || [];
          const location = {
            name: place.formatted_address || mainText,
            lat: place.geometry?.location?.lat() ?? null,
            lng: place.geometry?.location?.lng() ?? null,
            city:
              getComponent(comps, 'locality') ||
              getComponent(comps, 'postal_town') ||
              getComponent(comps, 'administrative_area_level_2'),
            state: getComponent(comps, 'administrative_area_level_1'),
            country: getComponent(comps, 'country'),
          };

          setLocation(location);

          // Regenerate session token after completed session (cost optimisation)
          const gp = window.google?.maps?.places;
          if (gp) {
            sessionToken.current = new gp.AutocompleteSessionToken();
          }

          onSelect?.(location);
        }
      );
    },
    [setLocation, onSelect]
  );

  // ── Clear ────────────────────────────────────────────────────────────────
  const handleClear = (e) => {
    e.preventDefault();
    e.stopPropagation();
    clearLocation();
    setInputValue('');
    setPredictions([]);
    setIsOpen(false);
  };

  // ── Keyboard navigation ──────────────────────────────────────────────────
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

  // ── Display ──────────────────────────────────────────────────────────────
  const chipLabel =
    isSet && storedName
      ? storedName.length > 20
        ? storedName.slice(0, 18) + '…'
        : storedName
      : null;

  const inputPlaceholder = chipLabel ?? (isReady ? placeholder : 'Loading maps…');

  return (
    <div ref={containerRef} className="location-search-root">
      {/* Input row */}
      <div className="location-search-input-wrap">
        <MapPin size={16} className="location-search-pin-icon" />
        <input
          type="text"
          value={isFocused ? inputValue : ''}
          onChange={handleInputChange}
          onFocus={() => {
            setIsFocused(true);
            setInputValue('');
          }}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={inputPlaceholder}
          className="location-search-input"
          autoComplete="off"
          spellCheck={false}
          disabled={!isReady}
          aria-label="Search location"
          aria-expanded={isOpen}
          aria-autocomplete="list"
        />

        {isLoading ? (
          <Loader2 size={14} className="location-search-spinner" />
        ) : isSet ? (
          <button
            type="button"
            onMouseDown={handleClear}
            className="location-search-clear"
            aria-label="Clear location"
          >
            <X size={13} />
          </button>
        ) : null}
      </div>

      {/* Dropdown suggestions */}
      {isOpen && predictions.length > 0 && (
        <ul className="location-search-dropdown" role="listbox">
          {predictions.map((pred, idx) => (
            <li
              key={pred.place_id}
              role="option"
              aria-selected={idx === activeIndex}
              className={`location-search-option${idx === activeIndex ? ' is-active' : ''}`}
              onMouseDown={(e) => {
                e.preventDefault(); // prevent input blur before handler fires
                handleSelect(pred);
              }}
              onMouseEnter={() => setActiveIndex(idx)}
            >
              <MapPin size={13} className="location-search-option-icon" />
              <div className="location-search-option-text">
                <span className="location-search-option-main">
                  {pred.structured_formatting?.main_text || pred.description}
                </span>
                {pred.structured_formatting?.secondary_text && (
                  <span className="location-search-option-secondary">
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
