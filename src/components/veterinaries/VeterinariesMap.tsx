"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow, MarkerClustererF } from '@react-google-maps/api';
import type { ClusterIconStyle, TCalculator } from '@react-google-maps/marker-clusterer';
import { useTheme } from 'next-themes';
import type { PetPlace } from './types';
import { darkMapStyles, lightMapStyles } from 'kadesh/components/animals/constants';

// Estilos para los clusters: círculo naranja con la cantidad (3 tamaños)
function getClusterStyles(): ClusterIconStyle[] {
  if (typeof btoa === 'undefined') return [];
  const svg = (size: number) =>
    btoa(`<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 2}" fill="#f97316" stroke="#fff" stroke-width="2"/></svg>`);
  return [
    { url: `data:image/svg+xml;base64,${svg(44)}`, height: 44, width: 44, textColor: '#ffffff', textSize: 14, fontWeight: 'bold' },
    { url: `data:image/svg+xml;base64,${svg(52)}`, height: 52, width: 52, textColor: '#ffffff', textSize: 16, fontWeight: 'bold' },
    { url: `data:image/svg+xml;base64,${svg(60)}`, height: 60, width: 60, textColor: '#ffffff', textSize: 18, fontWeight: 'bold' },
  ];
}

const clusterCalculator: TCalculator = (markers, numStyles) => ({
  text: String(markers.length),
  index: Math.min(Math.ceil(Math.log10(markers.length + 1)), numStyles),
  title: `${markers.length} veterinaria${markers.length !== 1 ? 's' : ''}`,
});

interface VeterinariesMapProps {
  places: PetPlace[];
  selectedPlace: PetPlace | null;
  onPlaceClick: (place: PetPlace | null) => void;
  height?: string;
}

const mapContainerStyle = { width: '100%', height: '100%' };
const defaultCenter = { lat: 19.4326, lng: -99.1332 };

const HOTEL_ICON_PATHS = [
  'M3 4V20C3 20.9428 3 21.4142 3.29289 21.7071C3.58579 22 4.05719 22 5 22H19C19.9428 22 20.4142 22 20.7071 21.7071C21 21.4142 21 20.9428 21 20V4',
  'M10.5 8V9.5M10.5 11V9.5M13.5 8V9.5M13.5 11V9.5M10.5 9.5H13.5',
  'M14 22L14 17.9999C14 16.8954 13.1046 15.9999 12 15.9999C10.8954 15.9999 10 16.8954 10 17.9999V22',
  'M2 4H8C8.6399 2.82727 10.1897 2 12 2C13.8103 2 15.3601 2.82727 16 4H22',
  'M6 8H7M6 12H7M6 16H7',
  'M17 8H18M17 12H18M17 16H18',
];

function createVeterinaryIcon(): string | google.maps.Icon {
  const paths = HOTEL_ICON_PATHS.map(
    (d) =>
      `<path fill="#FFFFFF" stroke="#f97316" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="${d}"/>`
  ).join('');
  const svg = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    ${paths}
  </svg>`;
  const dataUri = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  if (typeof window !== 'undefined' && window.google?.maps) {
    return {
      url: dataUri,
      scaledSize: { width: 22, height: 22 },
      anchor: { x: 11, y: 11 },
      cursor: 'pointer',
    } as unknown as google.maps.Icon;
  }
  return dataUri;
}

export default function VeterinariesMap({
  places,
  selectedPlace,
  onPlaceClick,
  height = '100%',
}: VeterinariesMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const { resolvedTheme } = useTheme();
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [mounted, setMounted] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [defaultIcon, setDefaultIcon] = useState<string | google.maps.Icon | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDarkMode = mounted && resolvedTheme === 'dark';

  const placesWithCoords = useMemo(
    () =>
      places.filter((p) => {
        const lat = parseFloat(p.lat);
        const lng = parseFloat(p.lng);
        return !Number.isNaN(lat) && !Number.isNaN(lng);
      }),
    [places]
  );

  useEffect(() => {
    if (!map || typeof window === 'undefined' || !window.google?.maps) return;
    const points: { lat: number; lng: number }[] = placesWithCoords.map((p) => ({
      lat: parseFloat(p.lat),
      lng: parseFloat(p.lng),
    }));
    if (userLocation) points.push(userLocation);
    if (points.length === 0) return;
    const bounds = new window.google.maps.LatLngBounds();
    if (points.length === 1) {
      map.setCenter(points[0]);
      map.setZoom(12);
      return;
    }
    points.forEach((p) => bounds.extend(p));
    map.fitBounds(bounds, { top: 48, right: 48, bottom: 48, left: 48 });
  }, [map, placesWithCoords, userLocation]);

  useEffect(() => {
    if (!mounted || typeof window === 'undefined' || !window.navigator?.geolocation) return;
    window.navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }, [mounted]);

  useEffect(() => {
    if (map && mounted) {
      map.setOptions({ styles: isDarkMode ? darkMapStyles : lightMapStyles });
    }
  }, [isDarkMode, map, mounted]);

  useEffect(() => {
    if (!map || typeof window === 'undefined' || !window.google?.maps) return;
    setDefaultIcon(createVeterinaryIcon());
  }, [map]);

  const onLoad = useCallback((mapInstance: google.maps.Map) => setMap(mapInstance), []);
  const onUnmount = useCallback(() => setMap(null), []);

  const mapCenter = useMemo(() => {
    if (placesWithCoords.length === 0) return defaultCenter;
    const sumLat = placesWithCoords.reduce((s, p) => s + parseFloat(p.lat), 0);
    const sumLng = placesWithCoords.reduce((s, p) => s + parseFloat(p.lng), 0);
    return {
      lat: sumLat / placesWithCoords.length,
      lng: sumLng / placesWithCoords.length,
    };
  }, [placesWithCoords]);

  const createUserLocationIcon = useCallback((): string | google.maps.Icon => {
    const svg = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="#4285F4" opacity="0.3"/>
      <circle cx="12" cy="12" r="7" fill="#4285F4" opacity="0.5"/>
      <circle cx="12" cy="12" r="4" fill="#fff" stroke="#4285F4" stroke-width="2"/>
    </svg>`;
    const dataUri = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
    if (typeof window !== 'undefined' && window.google?.maps) {
      return {
        url: dataUri,
        scaledSize: { width: 30, height: 30 },
        anchor: { x: 15, y: 15 },
      } as unknown as google.maps.Icon;
    }
    return dataUri;
  }, []);

  if (!apiKey) {
    return (
      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center" style={{ height }}>
        <p className="text-gray-600 dark:text-gray-400">Google Maps API key no configurada.</p>
      </div>
    );
  }

  const mapOptions = useMemo(
    () => ({
      styles: isDarkMode ? darkMapStyles : lightMapStyles,
      disableDefaultUI: true,
      zoomControl: true,
      streetViewControl: false,
      mapTypeControl: false,
      fullscreenControl: true,
    }),
    [isDarkMode]
  );

  const clusterStylesMemo = useMemo(() => getClusterStyles(), []);

  const mapContent = (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={mapCenter}
      zoom={placesWithCoords.length > 1 ? 12 : 10}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={mapOptions}
    >
      {map && (
        <>
          {userLocation && (
            <Marker position={userLocation} icon={createUserLocationIcon()} zIndex={1000} />
          )}
          <MarkerClustererF
            options={{
              ...(clusterStylesMemo.length > 0 && { styles: clusterStylesMemo }),
              calculator: clusterCalculator,
              averageCenter: true,
              minimumClusterSize: 2,
              maxZoom: 20,
              zoomOnClick: true,
            }}
          >
            {(clusterer) => (
              <>
                {placesWithCoords.map((place) => {
                  const position = { lat: parseFloat(place.lat), lng: parseFloat(place.lng) };
                  const isSelected = selectedPlace?.id === place.id;
                  return (
                    <Marker
                      key={place.id}
                      position={position}
                      icon={defaultIcon ?? undefined}
                      cursor="pointer"
                      onClick={() => onPlaceClick(place)}
                      clusterer={clusterer}
                    >
                      {isSelected && (
                        <InfoWindow position={position} onCloseClick={() => onPlaceClick(null)}>
                          <div
                            className={`p-3 min-w-[200px] max-w-[280px] ${isDarkMode ? 'bg-[#1e1e1e]' : ''}`}
                          >
                            <h3
                              className={`font-bold text-base leading-tight mb-2 ${
                                isDarkMode ? 'text-white' : 'text-[#212121]'
                              }`}
                            >
                              {place.name?.trim() || 'Veterinaria'}
                            </h3>
                            {typeof place.distance === 'number' && !Number.isNaN(place.distance) && (
                              <p
                                className={`text-sm font-medium mb-1.5 ${
                                  isDarkMode ? 'text-orange-400' : 'text-orange-600'
                                }`}
                              >
                                {place.distance < 1
                                  ? `${Math.round(place.distance * 1000)} m`
                                  : `${place.distance.toFixed(1)} km`}{' '}
                                de ti
                              </p>
                            )}
                            {[place.municipality, place.state].filter(Boolean).length > 0 && (
                              <p
                                className={`text-sm mb-1.5 ${
                                  isDarkMode ? 'text-[#b0b0b0]' : 'text-[#616161]'
                                }`}
                              >
                                {[place.municipality, place.state].filter(Boolean).join(', ')}
                              </p>
                            )}
                            {place.address && !place.municipality && (
                              <p
                                className={`text-sm mb-1.5 truncate ${isDarkMode ? 'text-[#b0b0b0]' : 'text-[#616161]'}`}
                                title={place.address}
                              >
                                {place.address}
                              </p>
                            )}
                            {place.isOpen != null && place.isOpen && (
                              <span
                                className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mb-1.5 ${
                                  place.isOpen
                                    ? isDarkMode
                                      ? 'bg-green-900/40 text-green-300'
                                      : 'bg-green-100 text-green-700'
                                    : isDarkMode
                                      ? 'bg-gray-700 text-gray-300'
                                      : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                Abierto
                              </span>
                            )}
                            {place.phone && (
                              <a
                                href={`tel:${place.phone.replace(/\s/g, '')}`}
                                className={`block text-sm font-medium hover:underline ${
                                  isDarkMode ? 'text-orange-400' : 'text-orange-600'
                                }`}
                              >
                                {place.phone}
                              </a>
                            )}
                          </div>
                        </InfoWindow>
                      )}
                    </Marker>
                  );
                })}
              </>
            )}
          </MarkerClustererF>
        </>
      )}
    </GoogleMap>
  );

  return (
    <div className="w-full overflow-hidden relative" style={{ height }}>
      <LoadScript
        googleMapsApiKey={apiKey}
        loadingElement={<div className="w-full animate-pulse bg-[#f5f5f5] dark:bg-[#1e1e1e]" style={{ height }} />}
      >
        {mapContent}
      </LoadScript>
    </div>
  );
}
