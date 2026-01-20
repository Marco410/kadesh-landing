"use client";

import { useMemo, useCallback, useEffect, useState } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { useTheme } from 'next-themes';
import { LostAnimal } from './types';
import { darkMapStyles, getStatusColor, lightMapStyles } from './constants';
import AnimalInfoWindow from './AnimalInfoWindow';

interface AnimalsMapProps {
  animals: LostAnimal[];
  selectedAnimal?: LostAnimal | null;
  onAnimalClick?: (animal: LostAnimal) => void;
  height?: string;
}

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const defaultCenter = {
  lat: 19.4326, // Ciudad de México
  lng: -99.1332,
};

export default function AnimalsMap({ 
  animals, 
  selectedAnimal, 
  onAnimalClick,
  height = '600px'
}: AnimalsMapProps) {
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const { resolvedTheme } = useTheme();
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [mounted, setMounted] = useState(false);
  const [markerIcons, setMarkerIcons] = useState<Record<string, string | google.maps.Icon>>({});
  const [isLocating, setIsLocating] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Wait for theme to be resolved
  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine if dark mode is active
  const isDarkMode = mounted && resolvedTheme === 'dark';

  // Helper function for default icon (synchronous)
  const createDefaultIcon = useCallback((color: string): string | google.maps.Icon => {
    const teardropPath = 'M12 2C16.8706 2 21 6.03298 21 10.9258C21 15.8965 16.8033 19.3847 12.927 21.7567C12.6445 21.9162 12.325 22 12 22C11.675 22 11.3555 21.9162 11.073 21.7567C7.2039 19.3616 3 15.9137 3 10.9258C3 6.03298 7.12944 2 12 2Z';
    
    const pawPrintSVG = `
      <g transform="translate(8, 6.5) scale(0.011) translate(-256, -256)">
        <path fill="#ffffff" d="M354.62,846.029c-53.023,17.026-112.892-21.761-133.706-86.622c-27.031-84.203-8.904-175.426,44.129-192.442
          c53.023-17.026,122.825,52.725,147.89,130.803C433.748,762.629,407.654,829.003,354.62,846.029z"/>
        <path fill="#ffffff" d="M835.854,1045.892c-77.687,13.114-113.777-15.739-163.599-7.339c-49.832,8.41-74.445,47.506-152.132,60.61
          c-101.702,17.149-198.464-96.37-120.324-195.407c97.111-123.062,107.714-259.032,203.292-275.152
          c95.588-16.12,150.207,108.836,282.317,193.234C991.711,889.757,937.546,1028.743,835.854,1045.892z"/>
        <path fill="#ffffff" d="M599.488,455.277c-6.691-81.722,31.149-172.863,86.643-177.413c55.514-4.54,107.137,72.818,114.353,160.953
          c5.559,67.898-34.927,126.624-90.431,131.163C654.549,574.531,605.047,523.175,599.488,455.277z"/>
        <path fill="#ffffff" d="M354.363,514.075c-22.09-85.623,1.297-175.642,55.226-189.549c53.919-13.917,119.562,59.766,140.047,139.161
          c17.026,65.962-12.888,130.71-66.807,144.627C428.9,622.232,371.389,580.038,354.363,514.075z"/>
        <path fill="#ffffff" d="M909.145,752.479c-55.679,1.318-102.114-52.828-103.73-120.931c-1.935-81.969,41.134-170.763,96.802-172.07
          c55.679-1.318,102.732,78.902,104.821,167.305C1008.645,694.885,964.814,751.161,909.145,752.479z"/>
      </g>
    `;

    const svg = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="shadow-${color.replace('#', '')}">
            <feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-opacity="0.3"/>
          </filter>
        </defs>
        <path d="${teardropPath}" 
              fill="${color}" 
              stroke="#ffffff" 
              stroke-width="1" 
              stroke-linejoin="round" 
              stroke-linecap="round"
              filter="url(#shadow-${color.replace('#', '')})"/>
        ${pawPrintSVG}
      </svg>`;

    const encodedSvg = encodeURIComponent(svg);
    const dataUri = `data:image/svg+xml;charset=UTF-8,${encodedSvg}`;

    if (typeof window !== 'undefined' && window.google?.maps) {
      return {
        url: dataUri,
        scaledSize: new window.google.maps.Size(40, 40),
        anchor: new window.google.maps.Point(20, 36.67),
        cursor: 'pointer',
      } as google.maps.Icon;
    }

    return dataUri;
  }, []);

  // Create custom marker icon - circular image if available, otherwise use default icon
  const createMarkerIcon = useCallback((color: string, imageUrl?: string): Promise<string | google.maps.Icon> => {
    // Always return default icon for now to ensure markers are visible
    // Canvas approach has CORS issues with S3, so we'll use default icon
    // TODO: Implement proxy or server-side image processing for circular markers
    return Promise.resolve(createDefaultIcon(color));
  }, [createDefaultIcon]);

  // Update map styles when dark mode changes
  useEffect(() => {
    if (map && mounted) {
      const newStyles = isDarkMode ? darkMapStyles : lightMapStyles;
      map.setOptions({
        styles: newStyles,
      });
    }
  }, [isDarkMode, map, mounted]);

  // Load marker icons for animals with images
  useEffect(() => {
    const loadIcons = async () => {
      const iconPromises = animals
        .filter(animal => animal.latitude !== undefined && animal.longitude !== undefined)
        .map(async (animal) => {
          // If animal has image, use createMarkerIcon, otherwise use default
          const icon = animal.image?.url
            ? await createMarkerIcon(
                getStatusColor(animal.status),
                animal.image.url
              )
            : createDefaultIcon(getStatusColor(animal.status));
          return { animalId: animal.id, icon };
        });

      const icons = await Promise.all(iconPromises);
      const iconsMap: Record<string, string | google.maps.Icon> = {};
      icons.forEach(({ animalId, icon }) => {
        iconsMap[animalId] = icon;
      });
      setMarkerIcons(iconsMap);
    };

    if (mounted) {
      loadIcons();
    }
  }, [animals, createMarkerIcon, createDefaultIcon, mounted]);

  // Inject styles for InfoWindow dark mode and apply when InfoWindow opens

  const onLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  }, []);

  // Get user location automatically when component mounts
  useEffect(() => {
    if (!mounted || typeof window === 'undefined' || !window.navigator?.geolocation) {
      return;
    }

    // Get user location automatically
    window.navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(location);
      },
      (error) => {
        // Silently fail - user location is optional
        console.log('User location not available:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // Cache for 5 minutes
      }
    );
  }, [mounted]);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Calculate map center based on animals
  const mapCenter = useMemo(() => {
    if (animals.length === 0) return defaultCenter;
    
    const animalsWithCoords = animals.filter(
      a => a.latitude !== undefined && a.longitude !== undefined
    );
    
    if (animalsWithCoords.length === 0) return defaultCenter;

    const avgLat = animalsWithCoords.reduce((sum, a) => sum + (a.latitude || 0), 0) / animalsWithCoords.length;
    const avgLng = animalsWithCoords.reduce((sum, a) => sum + (a.longitude || 0), 0) / animalsWithCoords.length;

    return { lat: avgLat, lng: avgLng };
  }, [animals]);

  const handleMarkerClick = useCallback((animal: LostAnimal) => {
    if (onAnimalClick) {
      onAnimalClick(animal);
    }
  }, [onAnimalClick]);

  // Create user location marker icon
  const createUserLocationIcon = useCallback((): string | google.maps.Icon => {
    const svg = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="userLocationShadow">
            <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.4"/>
          </filter>
        </defs>
        <!-- Outer pulsing circle -->
        <circle cx="12" cy="12" r="10" fill="#4285F4" opacity="0.3" filter="url(#userLocationShadow)"/>
        <!-- Middle circle -->
        <circle cx="12" cy="12" r="7" fill="#4285F4" opacity="0.5"/>
        <!-- Inner dot -->
        <circle cx="12" cy="12" r="4" fill="#ffffff" stroke="#4285F4" stroke-width="2"/>
      </svg>`;

    const encodedSvg = encodeURIComponent(svg);
    const dataUri = `data:image/svg+xml;charset=UTF-8,${encodedSvg}`;

    // Use Google Maps API classes - they should be available when LoadScript loads
    if (typeof window !== 'undefined' && window.google?.maps) {
      const Size = window.google.maps.Size;
      const Point = window.google.maps.Point;
      
      if (Size && Point) {
        return {
          url: dataUri,
          scaledSize: new Size(48, 48),
          anchor: new Point(24, 24),
        } as google.maps.Icon;
      }
    }

    // Fallback: return just the URL string (simpler, but less control)
    return dataUri;
  }, []);

  // Center map on user's location
  const handleCenterOnUser = useCallback(() => {
    if (!map || typeof window === 'undefined' || !window.navigator?.geolocation) {
      return;
    }

    setIsLocating(true);

    window.navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        // Set user location state to show marker
        setUserLocation(location);

        // Center and zoom to user location
        map.setCenter(location);
        map.setZoom(14);
        setIsLocating(false);
      },
      (error) => {
        console.error('Error getting user location:', error);
        setIsLocating(false);
        // Optionally show a toast/notification to the user
        alert('No se pudo obtener tu ubicación. Por favor, verifica que los permisos de ubicación estén activados.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, [map]);

  if (!googleMapsApiKey) {
    return (
      <div 
        className="w-full bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center"
        style={{ height }}
      >
        <p className="text-gray-600 dark:text-gray-400">
          Google Maps API key no configurada. Por favor configura en tus variables de entorno.
        </p>
      </div>
    );
  }

  // Memoize map options to ensure they update when theme changes
  const mapOptions = useMemo(() => ({
    styles: isDarkMode ? darkMapStyles : lightMapStyles,
    disableDefaultUI: true,
    zoomControl: true,
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: true,
  }), [isDarkMode]);

  return (
    <div className="w-full overflow-hidden shadow-lg relative" style={{ height }}>
      <LoadScript googleMapsApiKey={googleMapsApiKey}>
        <GoogleMap
          key={`map-${isDarkMode ? 'dark' : 'light'}`}
          mapContainerStyle={mapContainerStyle}
          center={mapCenter}
          zoom={animals.length > 1 ? 13 : 10}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={mapOptions}
        >
          {/* User location marker */}
          {userLocation && (
            <Marker
              position={userLocation}
              icon={createUserLocationIcon()}
              zIndex={1000}
            />
          )}

          {animals
            .filter(animal => animal.latitude !== undefined && animal.longitude !== undefined)
            .map((animal) => {
              // Always ensure we have a valid icon - use from state if loaded, otherwise create default immediately
              const defaultIcon = createDefaultIcon(getStatusColor(animal.status));
              const icon: string | google.maps.Icon = markerIcons[animal.id] || defaultIcon;
              
              // Ensure icon has cursor pointer
              const iconWithCursor = typeof icon === 'object' && 'url' in icon
                ? { ...icon, cursor: 'pointer' as const }
                : icon;
              
              return (
              <Marker
                key={animal.id}
                position={{
                  lat: animal.latitude!,
                  lng: animal.longitude!,
                }}
                onClick={() => handleMarkerClick(animal)}
                icon={iconWithCursor}
                cursor="pointer"
              >
                {selectedAnimal?.id === animal.id && (
                  <InfoWindow
                    position={{
                      lat: animal.latitude!,
                      lng: animal.longitude!,
                    }}
                    onCloseClick={() => onAnimalClick?.(null as any)}
                  >
                    <AnimalInfoWindow
                      animal={animal}
                      isDarkMode={isDarkMode}
                      onClose={() => onAnimalClick?.(null as any)}
                    />
                  </InfoWindow>
                )}
              </Marker>
              );
            })}
        </GoogleMap>
      </LoadScript>
      
      {/* Button to center on user location - only after mount to avoid hydration mismatch */}
      {mounted && typeof window !== 'undefined' && window.navigator?.geolocation && (
        <button
          onClick={handleCenterOnUser}
          disabled={isLocating || !map}
          className="absolute bottom-4 left-4 z-10 bg-white dark:bg-[#1e1e1e] hover:bg-gray-100 dark:hover:bg-[#2a2a2a] text-gray-700 dark:text-gray-200 rounded-full p-3 shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          title="Centrar en mi ubicación"
          aria-label="Centrar mapa en mi ubicación"
        >
          {isLocating ? (
            <svg
              className="w-6 h-6 animate-spin"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          ) : (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          )}
        </button>
      )}
    </div>
  );
}
