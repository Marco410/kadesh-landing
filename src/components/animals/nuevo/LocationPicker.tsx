'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon, Location01Icon, Search01Icon } from '@hugeicons/core-free-icons';
import { sileo } from 'sileo';
import {
  GEO_OPTIONS_FRESH,
  isGeolocationAvailable,
  requestCurrentPosition,
} from 'kadesh/utils/geolocation';
import {
  applyFreeMapThemeClass,
  attachFreeMapBaseLayer,
  createBrandPinIcon,
  getLeaflet,
  isDarkMapTheme,
  loadLeafletStack,
  resetLeafletContainer,
  type LeafletMap,
  type LeafletMarker,
} from 'kadesh/components/shared/free-map';
import {
  MORELIA_CENTER,
  reverseGeocodeNominatim,
  searchNominatim,
  type ParsedPlace,
  type SearchHit,
} from 'kadesh/components/animals/nuevo/nominatimPlace';

interface LocationPickerProps {
  lat: string;
  lng: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  onLocationChange: (lat: string, lng: string) => void;
  onAddressChange?: (
    address: string,
    city: string,
    state: string,
    country: string
  ) => void;
  onPlaceDetails?: (details: { neighborhood: string; postalCode: string }) => void;
  onAddressEdited?: (edited: boolean) => void;
  onResolvingChange?: (isResolving: boolean) => void;
  mapCenter?: { lat: number; lng: number };
  className?: string;
  isVisible?: boolean;
  compact?: boolean;
}

const PIN_ZOOM = 15;
const DEFAULT_ZOOM = 12;
const EMPTY_SEARCH =
  'No encontramos esa colonia. Busca una calle cercana o toca el mapa para poner el pin.';

export default function LocationPicker({
  lat,
  lng,
  address = '',
  city = '',
  state = '',
  country = '',
  onLocationChange,
  onAddressChange,
  onPlaceDetails,
  onAddressEdited,
  onResolvingChange,
  mapCenter,
  className = '',
  isVisible = true,
  compact = false,
}: LocationPickerProps) {
  const { resolvedTheme } = useTheme();
  const [ready, setReady] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [locationQuery, setLocationQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchHit[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchMiss, setSearchMiss] = useState(false);
  const [localAddress, setLocalAddress] = useState(address);
  const [localCity, setLocalCity] = useState(city);
  const [localState, setLocalState] = useState(state);
  const [localCountry, setLocalCountry] = useState(country);
  const [askForCity, setAskForCity] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapFrameRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<LeafletMarker | null>(null);
  const geocodeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onLocationChangeRef = useRef(onLocationChange);
  const onAddressChangeRef = useRef(onAddressChange);
  const onPlaceDetailsRef = useRef(onPlaceDetails);
  const onAddressEditedRef = useRef(onAddressEdited);
  const onResolvingChangeRef = useRef(onResolvingChange);
  const addressEditedRef = useRef(false);
  const localAddressRef = useRef(address);
  const biasRef = useRef(mapCenter ?? MORELIA_CENTER);

  onLocationChangeRef.current = onLocationChange;
  onAddressChangeRef.current = onAddressChange;
  onPlaceDetailsRef.current = onPlaceDetails;
  onAddressEditedRef.current = onAddressEdited;
  onResolvingChangeRef.current = onResolvingChange;
  localAddressRef.current = localAddress;
  biasRef.current = mapCenter ?? MORELIA_CENTER;

  const hasValidCoordinates = Boolean(lat && lng && !Number.isNaN(parseFloat(lat)) && !Number.isNaN(parseFloat(lng)));
  const isDarkMode = mounted && isDarkMapTheme(resolvedTheme);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setLocalAddress(address);
    setLocalCity(city);
    setLocalState(state);
    setLocalCountry(country);
  }, [address, city, state, country]);

  useEffect(() => {
    onResolvingChangeRef.current?.(isGeocoding);
    return () => onResolvingChangeRef.current?.(false);
  }, [isGeocoding]);

  useEffect(() => {
    if (!compact || isGeocoding) return;
    if (hasValidCoordinates && !city.trim()) setAskForCity(true);
  }, [compact, isGeocoding, hasValidCoordinates, city]);

  useEffect(() => {
    if (!isVisible) return;
    let cancelled = false;
    loadLeafletStack()
      .then(() => {
        if (!cancelled) setReady(true);
      })
      .catch((err) => console.error('Leaflet load error', err));
    return () => {
      cancelled = true;
    };
  }, [isVisible]);

  const applyAddress = useCallback((next: ParsedPlace, keepAddress = false) => {
    const nextAddress = keepAddress ? localAddressRef.current : next.address;
    if (!keepAddress) {
      addressEditedRef.current = false;
      onAddressEditedRef.current?.(false);
      setLocalAddress(nextAddress);
    }
    setLocalCity(next.city);
    setLocalState(next.state);
    setLocalCountry(next.country);
    onAddressChangeRef.current?.(nextAddress, next.city, next.state, next.country);
    onPlaceDetailsRef.current?.({
      neighborhood: next.neighborhood,
      postalCode: next.postalCode,
    });
  }, []);

  const doReverseGeocode = useCallback(
    async (latitude: number, longitude: number) => {
      setIsGeocoding(true);
      const result = await reverseGeocodeNominatim(latitude, longitude);
      setIsGeocoding(false);
      if (result) applyAddress(result, addressEditedRef.current);
    },
    [applyAddress]
  );

  const updateMarker = useCallback((latitude: number, longitude: number) => {
    const L = getLeaflet();
    const map = mapRef.current;
    if (!L || !map) return;
    if (markerRef.current) {
      markerRef.current.setLatLng([latitude, longitude]);
      return;
    }
    markerRef.current = L.marker([latitude, longitude], {
      icon: createBrandPinIcon(L),
      draggable: true,
    }).addTo(map);
    markerRef.current.on('dragend', () => {
      const next = markerRef.current?.getLatLng();
      if (!next) return;
      onLocationChangeRef.current(next.lat.toString(), next.lng.toString());
      void doReverseGeocode(next.lat, next.lng);
    });
  }, [doReverseGeocode]);

  const handleMapClick = useCallback((...args: unknown[]) => {
    const e = args[0] as { latlng: { lat: number; lng: number } };
    const { lat: clickLat, lng: clickLng } = e.latlng;
    onLocationChangeRef.current(clickLat.toString(), clickLng.toString());
    updateMarker(clickLat, clickLng);
    if (geocodeTimerRef.current) clearTimeout(geocodeTimerRef.current);
    geocodeTimerRef.current = setTimeout(() => {
      void doReverseGeocode(clickLat, clickLng);
    }, 300);
  }, [doReverseGeocode, updateMarker]);

  useEffect(() => {
    const L = getLeaflet();
    const container = mapContainerRef.current;
    if (!ready || !container || mapRef.current || !L) return;

    resetLeafletContainer(container);

    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    const hasCoords = !Number.isNaN(latNum) && !Number.isNaN(lngNum);
    const center: [number, number] = hasCoords
      ? [latNum, lngNum]
      : [biasRef.current.lat, biasRef.current.lng];
    const zoom = hasCoords ? PIN_ZOOM : DEFAULT_ZOOM;

    const map = L.map(container, { zoomControl: true }).setView(center, zoom);
    mapRef.current = map;
    attachFreeMapBaseLayer(map);
    applyFreeMapThemeClass(container, resolvedTheme);
    map.on('click', handleMapClick);

    if (hasCoords) {
      updateMarker(latNum, lngNum);
    }

    requestAnimationFrame(() => map.invalidateSize());
    const later = window.setTimeout(() => map.invalidateSize(), 250);
    const again = window.setTimeout(() => map.invalidateSize(), 600);

    return () => {
      window.clearTimeout(later);
      window.clearTimeout(again);
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  useEffect(() => {
    if (!mounted || !ready) return;
    applyFreeMapThemeClass(mapContainerRef.current, resolvedTheme);
  }, [mounted, ready, resolvedTheme]);

  useEffect(() => {
    if (!isVisible || !mapRef.current) return;
    const map = mapRef.current;
    const kick = () => map.invalidateSize();
    const frame = requestAnimationFrame(kick);
    const later = window.setTimeout(kick, 180);
    const again = window.setTimeout(kick, 500);
    const node = mapContainerRef.current;
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(kick);
    if (node && observer) observer.observe(node);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(later);
      window.clearTimeout(again);
      observer?.disconnect();
    };
  }, [isVisible, ready]);

  useEffect(() => {
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    if (!Number.isNaN(latNum) && !Number.isNaN(lngNum) && mapRef.current) {
      updateMarker(latNum, lngNum);
      mapRef.current.setView([latNum, lngNum], mapRef.current.getZoom());
    }
  }, [lat, lng, updateMarker]);

  useEffect(() => {
    if (!mapRef.current || hasValidCoordinates) return;
    const center = mapCenter ?? MORELIA_CENTER;
    mapRef.current.setView([center.lat, center.lng], DEFAULT_ZOOM);
  }, [mapCenter, hasValidCoordinates]);

  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    const query = locationQuery.trim();
    if (query.length < 3) {
      setSuggestions([]);
      setSearchMiss(false);
      return;
    }
    searchTimerRef.current = setTimeout(() => {
      void searchNominatim(query, biasRef.current)
        .then((hits) => {
          setSuggestions(hits);
          setSearchMiss(hits.length === 0);
          setShowSuggestions(hits.length > 0);
        })
        .catch(() => {
          setSuggestions([]);
          setSearchMiss(true);
        });
    }, 350);
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, [locationQuery]);

  const applyHit = useCallback(
    (hit: SearchHit) => {
      onLocationChangeRef.current(hit.lat.toString(), hit.lng.toString());
      applyAddress(hit);
      updateMarker(hit.lat, hit.lng);
      mapRef.current?.setView([hit.lat, hit.lng], PIN_ZOOM);
      setLocationQuery(hit.label);
      setShowSuggestions(false);
      searchInputRef.current?.blur();
      mapFrameRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    },
    [applyAddress, updateMarker]
  );

  const handleSearchLocation = useCallback(async () => {
    const query = locationQuery.trim();
    if (!query) return;
    try {
      const hits = await searchNominatim(query, biasRef.current);
      setSuggestions(hits);
      setSearchMiss(hits.length === 0);
      if (hits[0]) {
        applyHit(hits[0]);
      }
    } catch {
      sileo.error({ title: 'No se pudo buscar la ubicación' });
    }
  }, [applyHit, locationQuery]);

  const handleUseCurrentLocation = useCallback(() => {
    if (!isGeolocationAvailable()) {
      sileo.error({ title: 'Tu navegador no soporta geolocalización' });
      return;
    }
    setIsLoadingLocation(true);
    requestCurrentPosition(GEO_OPTIONS_FRESH)
      .then(({ lat, lng }) => {
        onLocationChangeRef.current(lat.toString(), lng.toString());
        updateMarker(lat, lng);
        mapRef.current?.setView([lat, lng], PIN_ZOOM);
        void doReverseGeocode(lat, lng);
      })
      .catch(() => {
        sileo.error({
          title: 'No se pudo obtener tu ubicación. Verifica los permisos del navegador.',
        });
      })
      .finally(() => setIsLoadingLocation(false));
  }, [doReverseGeocode, updateMarker]);

  const inputClassName =
    'w-full min-h-12 rounded-xl border border-[#d8dee8] bg-white px-3 py-2 text-base sm:min-h-11 sm:text-sm text-[#121212] placeholder:text-[#5a5a5a] focus:outline-none focus:ring-2 focus:ring-kadesh dark:border-white/18 dark:bg-night dark:text-[#eef1f6] dark:placeholder:text-[#9aa3b2]';

  return (
    <div className={`space-y-3 ${className}`}>
      <div>
        <label htmlFor="location-search" className="block text-sm font-semibold text-[#121212] dark:text-[#eef1f6]">
          Ubicación <span className="text-red-600">*</span>
        </label>
        <p className="mt-1 text-xs text-[#5a5a5a] dark:text-[#9aa3b2]">
          Usa tu posición, busca una calle o toca el mapa.
        </p>
      </div>

      <button
        type="button"
        onClick={handleUseCurrentLocation}
        disabled={isLoadingLocation || !ready}
        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-kadesh px-4 text-base font-semibold text-white transition-colors hover:bg-kadesh-600 disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-11 sm:w-auto sm:rounded-full sm:text-sm"
      >
        <HugeiconsIcon
          icon={Location01Icon}
          size={18}
          className={isLoadingLocation ? 'animate-pulse text-white' : 'text-white'}
          strokeWidth={1.5}
        />
        {isLoadingLocation ? 'Buscando…' : 'Usar mi ubicación actual'}
      </button>

      <div className="relative">
        <HugeiconsIcon
          icon={Search01Icon}
          size={18}
          strokeWidth={1.5}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#5a5a5a] dark:text-[#9aa3b2]"
        />
        <input
          ref={searchInputRef}
          id="location-search"
          type="search"
          inputMode="search"
          enterKeyHint="search"
          autoComplete="off"
          value={locationQuery}
          onChange={(e) => {
            setLocationQuery(e.target.value);
            setSearchMiss(false);
          }}
          onFocus={() => {
            if (suggestions.length > 0) setShowSuggestions(true);
          }}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (suggestions[0]) {
                applyHit(suggestions[0]);
                return;
              }
              void handleSearchLocation();
            }
          }}
          className={`${inputClassName} pl-10 pr-11 [&::-webkit-search-cancel-button]:appearance-none`}
          placeholder="Busca colonia, parque o calle"
        />
        {locationQuery && (
          <button
            type="button"
            aria-label="Borrar búsqueda"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setLocationQuery('');
              setSuggestions([]);
              setShowSuggestions(false);
              searchInputRef.current?.focus();
            }}
            className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-[#5a5a5a] hover:bg-kadesh-50 dark:text-[#9aa3b2] dark:hover:bg-kadesh/15"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={18} strokeWidth={1.5} />
          </button>
        )}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto overscroll-contain rounded-xl border border-[#d8dee8] bg-white shadow-[0_12px_28px_rgba(15,35,80,0.14)] dark:border-white/12 dark:bg-night-raised">
            {suggestions.map((hit) => (
              <button
                key={hit.id}
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  applyHit(hit);
                }}
                className="block min-h-12 w-full border-b border-[#eef1f6] px-3 py-3 text-left text-sm leading-snug text-[#121212] transition-colors last:border-b-0 hover:bg-kadesh-50 dark:border-white/8 dark:text-[#eef1f6] dark:hover:bg-kadesh/15"
              >
                {hit.label}
              </button>
            ))}
          </div>
        )}
        {searchMiss && locationQuery.trim().length >= 3 && (
          <p className="mt-2 text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">{EMPTY_SEARCH}</p>
        )}
      </div>

      <div
        ref={mapFrameRef}
        className={`relative overflow-hidden rounded-xl border border-[#d8dee8] shadow-[0_10px_24px_rgba(15,35,80,0.1)] dark:border-white/12 ${
          compact ? 'h-[320px] sm:h-[360px]' : 'h-[360px]'
        }`}
      >
        <div
          ref={mapContainerRef}
          className={`h-full w-full ${
            isDarkMode ? 'kadesh-free-map--night' : 'kadesh-free-map--standard'
          }`}
        />
        {!ready && (
          <div className="absolute inset-0 z-[1] flex items-center justify-center bg-[#f7f8fa] dark:bg-night-raised">
            <p className="text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">Cargando mapa…</p>
          </div>
        )}
      </div>

      <div>
        <label htmlFor="lp-address" className="mb-1 block text-xs font-semibold text-[#5a5a5a] dark:text-[#9aa3b2]">
          Dirección {isGeocoding ? <span className="text-kadesh">(obteniendo…)</span> : null}
        </label>
        <input
          id="lp-address"
          type="text"
          autoComplete="street-address"
          value={localAddress}
          onChange={(e) => {
            addressEditedRef.current = true;
            onAddressEditedRef.current?.(true);
            localAddressRef.current = e.target.value;
            setLocalAddress(e.target.value);
            onAddressChange?.(e.target.value, localCity, localState, localCountry);
          }}
          className={inputClassName}
          placeholder="Se completa al fijar el pin, o escríbela"
        />
      </div>

      {compact && askForCity && (
        <div>
          <label htmlFor="lp-city" className="mb-1 block text-xs font-semibold text-[#5a5a5a] dark:text-[#9aa3b2]">
            Ciudad <span className="text-red-600">*</span>
          </label>
          <input
            id="lp-city"
            type="text"
            autoComplete="address-level2"
            value={localCity}
            onChange={(e) => {
              setLocalCity(e.target.value);
              onAddressChange?.(localAddress, e.target.value, localState, localCountry);
            }}
            className={inputClassName}
            placeholder="Ciudad o municipio"
          />
        </div>
      )}

      {!compact && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label htmlFor="lp-city" className="mb-1 block text-xs font-semibold text-[#5a5a5a] dark:text-[#9aa3b2]">
              Ciudad
            </label>
            <input
              id="lp-city"
              type="text"
              value={localCity}
              onChange={(e) => {
                setLocalCity(e.target.value);
                onAddressChange?.(localAddress, e.target.value, localState, localCountry);
              }}
              className={inputClassName}
              placeholder="Ciudad"
            />
          </div>
          <div>
            <label htmlFor="lp-state" className="mb-1 block text-xs font-semibold text-[#5a5a5a] dark:text-[#9aa3b2]">
              Estado
            </label>
            <input
              id="lp-state"
              type="text"
              value={localState}
              onChange={(e) => {
                setLocalState(e.target.value);
                onAddressChange?.(localAddress, localCity, e.target.value, localCountry);
              }}
              className={inputClassName}
              placeholder="Estado"
            />
          </div>
          <div>
            <label htmlFor="lp-country" className="mb-1 block text-xs font-semibold text-[#5a5a5a] dark:text-[#9aa3b2]">
              País
            </label>
            <input
              id="lp-country"
              type="text"
              value={localCountry}
              onChange={(e) => {
                setLocalCountry(e.target.value);
                onAddressChange?.(localAddress, localCity, localState, e.target.value);
              }}
              className={inputClassName}
              placeholder="País"
            />
          </div>
        </div>
      )}

      {hasValidCoordinates ? (
        <p className="text-xs text-[#5a5a5a] dark:text-[#9aa3b2]">
          Pin fijado{localCity ? ` · ${localCity}` : ''}. Arrástralo si hay que afinar.
        </p>
      ) : (
        <p className="text-xs text-[#5a5a5a] dark:text-[#9aa3b2]">
          Sin pin todavía. Usa tu ubicación, busca una calle o toca el mapa.
        </p>
      )}
    </div>
  );
}
