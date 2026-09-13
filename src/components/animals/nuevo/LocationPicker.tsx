'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import { HugeiconsIcon } from '@hugeicons/react';
import { Location01Icon } from '@hugeicons/core-free-icons';
import { sileo } from 'sileo';
import {
  applyFreeMapThemeClass,
  attachFreeMapBaseLayer,
  createBrandPinIcon,
  DEFAULT_MAP_CENTER,
  getLeaflet,
  isDarkMapTheme,
  loadLeafletStack,
  resetLeafletContainer,
  type LeafletMap,
  type LeafletMarker,
} from 'kadesh/components/shared/free-map';

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
  className?: string;
  isVisible?: boolean;
}

interface NominatimAddress {
  road?: string;
  house_number?: string;
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  state?: string;
  country?: string;
}

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
  address: NominatimAddress;
}

interface SearchHit {
  id: string;
  label: string;
  lat: number;
  lng: number;
  address: string;
  city: string;
  state: string;
  country: string;
}

const PIN_ZOOM = 15;
const DEFAULT_ZOOM = 12;

function parseNominatimAddress(data: NominatimResult) {
  const a = data.address ?? {};
  const streetAddress =
    [a.road, a.house_number].filter(Boolean).join(' ') || data.display_name;
  const city = a.city || a.town || a.village || a.municipality || '';
  return {
    address: streetAddress,
    city,
    state: a.state || '',
    country: a.country || '',
  };
}

async function reverseGeocodeNominatim(latitude: number, longitude: number) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
      { headers: { 'Accept-Language': 'es' } }
    );
    if (!res.ok) return null;
    const data: NominatimResult = await res.json();
    return parseNominatimAddress(data);
  } catch {
    return null;
  }
}

async function searchNominatim(query: string): Promise<SearchHit[]> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5&countrycodes=mx`,
    { headers: { 'Accept-Language': 'es' } }
  );
  if (!res.ok) return [];
  const data: NominatimResult[] = await res.json();
  return data.map((item, index) => {
    const parsed = parseNominatimAddress(item);
    return {
      id: `${item.lat}-${item.lon}-${index}`,
      label: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      ...parsed,
    };
  });
}

export default function LocationPicker({
  lat,
  lng,
  address = '',
  city = '',
  state = '',
  country = '',
  onLocationChange,
  onAddressChange,
  className = '',
  isVisible = true,
}: LocationPickerProps) {
  const { resolvedTheme } = useTheme();
  const [ready, setReady] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [locationQuery, setLocationQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchHit[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [localAddress, setLocalAddress] = useState(address);
  const [localCity, setLocalCity] = useState(city);
  const [localState, setLocalState] = useState(state);
  const [localCountry, setLocalCountry] = useState(country);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<LeafletMarker | null>(null);
  const geocodeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onLocationChangeRef = useRef(onLocationChange);
  const onAddressChangeRef = useRef(onAddressChange);

  onLocationChangeRef.current = onLocationChange;
  onAddressChangeRef.current = onAddressChange;

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

  const applyAddress = useCallback(
    (next: { address: string; city: string; state: string; country: string }) => {
      setLocalAddress(next.address);
      setLocalCity(next.city);
      setLocalState(next.state);
      setLocalCountry(next.country);
      onAddressChangeRef.current?.(next.address, next.city, next.state, next.country);
    },
    []
  );

  const doReverseGeocode = useCallback(
    async (latitude: number, longitude: number) => {
      setIsGeocoding(true);
      const result = await reverseGeocodeNominatim(latitude, longitude);
      setIsGeocoding(false);
      if (result) applyAddress(result);
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
      : [DEFAULT_MAP_CENTER.lat, DEFAULT_MAP_CENTER.lng];
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

    return () => {
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
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    if (!Number.isNaN(latNum) && !Number.isNaN(lngNum) && mapRef.current) {
      updateMarker(latNum, lngNum);
      mapRef.current.setView([latNum, lngNum], mapRef.current.getZoom());
    }
  }, [lat, lng, updateMarker]);

  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    const query = locationQuery.trim();
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }
    searchTimerRef.current = setTimeout(() => {
      void searchNominatim(query)
        .then((hits) => {
          setSuggestions(hits);
          setShowSuggestions(hits.length > 0);
        })
        .catch(() => setSuggestions([]));
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
    },
    [applyAddress, updateMarker]
  );

  const handleSearchLocation = useCallback(async () => {
    const query = locationQuery.trim();
    if (!query) return;
    setIsSearchingLocation(true);
    try {
      const hits = await searchNominatim(query);
      setSuggestions(hits);
      if (hits[0]) {
        applyHit(hits[0]);
      } else {
        sileo.error({ title: 'No se encontró esa ubicación' });
      }
    } catch {
      sileo.error({ title: 'No se pudo buscar la ubicación' });
    } finally {
      setIsSearchingLocation(false);
    }
  }, [applyHit, locationQuery]);

  const handleUseCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      sileo.error({ title: 'Tu navegador no soporta geolocalización' });
      return;
    }
    setIsLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLat = position.coords.latitude;
        const newLng = position.coords.longitude;
        onLocationChangeRef.current(newLat.toString(), newLng.toString());
        updateMarker(newLat, newLng);
        mapRef.current?.setView([newLat, newLng], PIN_ZOOM);
        void doReverseGeocode(newLat, newLng);
        setIsLoadingLocation(false);
      },
      () => {
        setIsLoadingLocation(false);
        sileo.error({
          title: 'No se pudo obtener tu ubicación. Verifica los permisos del navegador.',
        });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [doReverseGeocode, updateMarker]);

  const inputClassName =
    'w-full px-3 py-2 text-sm rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#121212] text-[#212121] dark:text-[#ffffff] placeholder:text-[#616161] dark:placeholder:text-[#b0b0b0] focus:outline-none focus:ring-2 focus:ring-kadesh dark:focus:ring-kadesh-400';

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <label className="block text-sm font-medium text-[#212121] dark:text-[#ffffff]">
              Ubicación <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-[#616161] dark:text-[#b0b0b0] mt-1">
              Da clic en el mapa para seleccionar una ubicación.
            </p>
          </div>
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={isLoadingLocation || !ready}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-kadesh hover:bg-kadesh-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <HugeiconsIcon
              icon={Location01Icon}
              size={15}
              className={isLoadingLocation ? 'animate-pulse text-white' : 'text-white'}
              strokeWidth={1.5}
            />
            {isLoadingLocation ? 'Obteniendo...' : 'Usar mi ubicación actual'}
          </button>
        </div>

        <div>
          <label
            htmlFor="location-search"
            className="block text-xs font-medium text-[#616161] dark:text-[#b0b0b0] mb-1"
          >
            Buscar ubicación por nombre
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative w-full">
              <input
                id="location-search"
                type="text"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
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
                className={inputClassName}
                placeholder="Ej: Parque México, Condesa"
              />
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-[#e0e0e0] bg-white shadow-lg dark:border-[#3a3a3a] dark:bg-[#121212]">
                  {suggestions.map((hit) => (
                    <button
                      key={hit.id}
                      type="button"
                      onMouseDown={() => applyHit(hit)}
                      className="w-full px-3 py-2 text-left text-sm text-[#212121] transition-colors hover:bg-[#f5f5f5] dark:text-white dark:hover:bg-[#1f1f1f]"
                    >
                      {hit.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => void handleSearchLocation()}
              disabled={isSearchingLocation || !locationQuery.trim()}
              className="rounded-lg bg-[#212121] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#333333] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#f5f5f5] dark:text-[#121212] dark:hover:bg-[#e0e0e0]"
            >
              {isSearchingLocation ? 'Buscando...' : 'Buscar'}
            </button>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-xl border border-[#e0e0e0] shadow-md dark:border-[#3a3a3a]">
        <div
          ref={mapContainerRef}
          className={`h-[400px] w-full ${
            isDarkMode ? 'kadesh-free-map--night' : 'kadesh-free-map--standard'
          }`}
          style={{ minHeight: 300 }}
        />
        {!ready && (
          <div className="absolute inset-0 z-[1] flex items-center justify-center bg-[#f5f5f5] dark:bg-[#1e1e1e]">
            <div className="text-center">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-b-2 border-kadesh" />
              <p className="text-sm text-[#616161] dark:text-[#b0b0b0]">Cargando mapa...</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="lat" className="mb-1 block text-xs font-medium text-[#616161] dark:text-[#b0b0b0]">
            Latitud {hasValidCoordinates ? null : <span className="text-red-500">*</span>}
          </label>
          <input id="lat" type="text" value={lat} disabled className={inputClassName} placeholder="Ej: 19.4326" />
        </div>
        <div>
          <label htmlFor="lng" className="mb-1 block text-xs font-medium text-[#616161] dark:text-[#b0b0b0]">
            Longitud
          </label>
          <input id="lng" type="text" value={lng} disabled className={inputClassName} placeholder="Ej: -99.1332" />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="lp-address" className="mb-1 block text-xs font-medium text-[#616161] dark:text-[#b0b0b0]">
            Dirección{' '}
            {isGeocoding && <span className="text-xs text-kadesh">(Obteniendo...)</span>}
          </label>
          <input
            id="lp-address"
            type="text"
            value={localAddress}
            onChange={(e) => {
              setLocalAddress(e.target.value);
              onAddressChange?.(e.target.value, localCity, localState, localCountry);
            }}
            className={inputClassName}
            placeholder="Dirección"
          />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label htmlFor="lp-city" className="mb-1 block text-xs font-medium text-[#616161] dark:text-[#b0b0b0]">
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
            <label htmlFor="lp-state" className="mb-1 block text-xs font-medium text-[#616161] dark:text-[#b0b0b0]">
              Estado/Provincia
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
              placeholder="Estado/Provincia"
            />
          </div>
          <div>
            <label htmlFor="lp-country" className="mb-1 block text-xs font-medium text-[#616161] dark:text-[#b0b0b0]">
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
      </div>

      <p className="text-xs text-[#616161] dark:text-[#b0b0b0]">
        Haz click en el mapa para seleccionar la ubicación
      </p>
    </div>
  );
}
