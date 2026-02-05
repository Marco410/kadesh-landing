"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { useTheme } from 'next-themes';
import { HugeiconsIcon } from '@hugeicons/react';
import { Location01Icon } from '@hugeicons/core-free-icons';
import { darkMapStyles, lightMapStyles } from '../constants';

interface LocationPickerProps {
  lat: string;
  lng: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  onLocationChange: (lat: string, lng: string) => void;
  onAddressChange?: (address: string, city: string, state: string, country: string) => void;
  className?: string;
  isVisible?: boolean;
}

const mapContainerStyle = {
  width: '100%',
  height: '400px',
};

const defaultCenter = {
  lat: 19.4326, // Ciudad de México
  lng: -99.1332,
};

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
  isVisible = true
}: LocationPickerProps) {
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapLoadError, setMapLoadError] = useState<string | null>(null);
  const [localAddress, setLocalAddress] = useState(address);
  const [localCity, setLocalCity] = useState(city);
  const [localState, setLocalState] = useState(state);
  const [localCountry, setLocalCountry] = useState(country);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDarkMode = mounted && resolvedTheme === 'dark';

  useEffect(() => {
    if (map && mounted) {
      const newStyles = isDarkMode ? darkMapStyles : lightMapStyles;
      map.setOptions({
        styles: newStyles,
      });
    }
  }, [isDarkMode, map, mounted]);

  useEffect(() => {
    if (!googleMapsApiKey || !isVisible) {
      setIsMapLoaded(false);
      return;
    }

    const checkGoogleMapsLoaded = () => {
      if (typeof window !== 'undefined' && window.google && window.google.maps) {
        setIsMapLoaded(true);
        setMapLoadError(null);
        return true;
      }
      return false;
    };

    setIsMapLoaded(false);
    setMapLoadError(null);

    const initTimer = setTimeout(() => {
      if (checkGoogleMapsLoaded()) {
        return;
      }

      const interval = setInterval(() => {
        if (checkGoogleMapsLoaded()) {
          clearInterval(interval);
        }
      }, 100);

      const timeout = setTimeout(() => {
        clearInterval(interval);
        if (!checkGoogleMapsLoaded()) {
          setMapLoadError('El mapa está tardando en cargar. Por favor, verifica tu conexión a internet.');
        }
      }, 10000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }, 100);

    return () => {
      clearTimeout(initTimer);
    };
  }, [googleMapsApiKey, isVisible]);

  const reverseGeocode = useCallback((latitude: number, longitude: number) => {
    if (typeof window === 'undefined' || !window.google || !window.google.maps || !window.google.maps.Geocoder) {
      return;
    }

    setIsGeocoding(true);
    const geocoder = new window.google.maps.Geocoder();
    
    geocoder.geocode(
      { location: { lat: latitude, lng: longitude } },
      (results, status) => {
        setIsGeocoding(false);
        
        if (status === 'OK' && results && results[0]) {
          const result = results[0];
          let streetAddress = '';
          let cityName = '';
          let stateName = '';
          let countryName = '';

          result.address_components.forEach((component) => {
            const types = component.types;
            
            if (types.includes('street_number')) {
              streetAddress = component.long_name + (streetAddress ? ' ' + streetAddress : '');
            } else if (types.includes('route')) {
              streetAddress = streetAddress ? streetAddress + ' ' + component.long_name : component.long_name;
            } else if (types.includes('locality') || types.includes('sublocality')) {
              if (!cityName) {
                cityName = component.long_name;
              }
            } else if (types.includes('administrative_area_level_1')) {
              stateName = component.long_name;
            } else if (types.includes('country')) {
              countryName = component.long_name;
            }
          });

          if (!streetAddress && result.formatted_address) {
            streetAddress = result.formatted_address;
          }

          setLocalAddress(streetAddress);
          setLocalCity(cityName);
          setLocalState(stateName);
          setLocalCountry(countryName);

          if (onAddressChange) {
            onAddressChange(streetAddress, cityName, stateName, countryName);
          }
        }
      }
    );
  }, [onAddressChange]);

  useEffect(() => {
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    
    if (!isNaN(latNum) && !isNaN(lngNum)) {
      setMapCenter({ lat: latNum, lng: lngNum });
      const timer = setTimeout(() => {
        reverseGeocode(latNum, lngNum);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [lat, lng, reverseGeocode]);

  useEffect(() => {
    setLocalAddress(address);
    setLocalCity(city);
    setLocalState(state);
    setLocalCountry(country);
  }, [address, city, state, country]);

  const handleUseCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert('La geolocalización no está disponible en tu navegador');
      return;
    }

    setIsLoadingLocation(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLat = position.coords.latitude.toString();
        const newLng = position.coords.longitude.toString();
        
        onLocationChange(newLat, newLng);
        setMapCenter({ lat: position.coords.latitude, lng: position.coords.longitude });
        reverseGeocode(position.coords.latitude, position.coords.longitude);
        setIsLoadingLocation(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('No se pudo obtener tu ubicación. Por favor, selecciona una ubicación en el mapa.');
        setIsLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, [onLocationChange, reverseGeocode]);

  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const newLat = e.latLng.lat().toString();
      const newLng = e.latLng.lng().toString();
      onLocationChange(newLat, newLng);
      reverseGeocode(e.latLng.lat(), e.latLng.lng());
    }
  }, [onLocationChange, reverseGeocode]);

  const handleLatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLat = e.target.value;
    onLocationChange(newLat, lng);
    
    const latNum = parseFloat(newLat);
    if (!isNaN(latNum) && !isNaN(parseFloat(lng))) {
      setMapCenter({ lat: latNum, lng: parseFloat(lng) });
    }
  };

  const handleLngChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLng = e.target.value;
    onLocationChange(lat, newLng);
    
    const lngNum = parseFloat(newLng);
    if (!isNaN(parseFloat(lat)) && !isNaN(lngNum)) {
      setMapCenter({ lat: parseFloat(lat), lng: lngNum });
    }
  };

  if (!googleMapsApiKey) {
    return (
      <div className={`bg-gray-100 dark:bg-gray-800 rounded-xl p-6 ${className}`}>
        <p className="text-gray-600 dark:text-gray-400 text-center">
          Google Maps API key no configurada. Por favor configura NEXT_PUBLIC_GOOGLE_MAPS_API_KEY en tus variables de entorno.
        </p>
      </div>
    );
  }

  const hasValidCoordinates = !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng));

  const onMapLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
    setIsMapLoaded(true);
    setMapLoadError(null);
  }, []);

  const onMapUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const mapOptions = useMemo(() => {
    const baseStyles = isDarkMode ? darkMapStyles : lightMapStyles;
    
    const additionalStyles = [
      {
        featureType: 'poi',
        elementType: 'all',
        stylers: [{ visibility: 'off' }],
      },
      {
        featureType: 'poi.business',
        elementType: 'all',
        stylers: [{ visibility: 'off' }],
      },
      {
        featureType: 'poi.attraction',
        elementType: 'all',
        stylers: [{ visibility: 'off' }],
      },
      {
        featureType: 'poi.place_of_worship',
        elementType: 'all',
        stylers: [{ visibility: 'off' }],
      },
      {
        featureType: 'poi.school',
        elementType: 'all',
        stylers: [{ visibility: 'off' }],
      },
      {
        featureType: 'poi.sports_complex',
        elementType: 'all',
        stylers: [{ visibility: 'off' }],
      },
      {
        featureType: 'transit',
        elementType: 'all',
        stylers: [{ visibility: 'off' }],
      },
      {
        featureType: 'transit.station',
        elementType: 'all',
        stylers: [{ visibility: 'off' }],
      },
      {
        featureType: 'transit.line',
        elementType: 'all',
        stylers: [{ visibility: 'off' }],
      },
    ];

    return {
      styles: [...baseStyles, ...additionalStyles],
      disableDefaultUI: true,
      zoomControl: true,
      streetViewControl: false,
      mapTypeControl: false,
      fullscreenControl: true,
    };
  }, [isDarkMode]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with button */}
      <div className="flex items-center justify-between">
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
          disabled={isLoadingLocation}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoadingLocation ? (
            <>
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Obteniendo...
            </>
          ) : (
            <>
              <HugeiconsIcon 
                icon={Location01Icon} 
                size={15} 
                className="text-white"
                strokeWidth={1.5}
              />
              Usar mi ubicación actual
            </>
          )}
        </button>
      </div>

      {/* Map */}
      <div className="rounded-xl overflow-hidden shadow-md border border-[#e0e0e0] dark:border-[#3a3a3a] relative">
        {mapLoadError ? (
          <div className="w-full h-[400px] bg-[#f5f5f5] dark:bg-[#1e1e1e] flex flex-col items-center justify-center p-6">
            <p className="text-red-500 dark:text-red-400 text-sm font-medium mb-2">
              Error al cargar el mapa
            </p>
            <p className="text-[#616161] dark:text-[#b0b0b0] text-xs text-center mb-4">
              {mapLoadError}
            </p>
            <button
              type="button"
              onClick={() => {
                setMapLoadError(null);
                setIsMapLoaded(false);
                // Force re-check
                if (typeof window !== 'undefined' && window.google && window.google.maps) {
                  setIsMapLoaded(true);
                }
              }}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Reintentar
            </button>
          </div>
        ) : !isMapLoaded ? (
          <div className="w-full h-[400px] bg-[#f5f5f5] dark:bg-[#1e1e1e] flex items-center justify-center absolute inset-0 z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-3"></div>
              <p className="text-[#616161] dark:text-[#b0b0b0] text-sm">Cargando mapa...</p>
            </div>
          </div>
        ) : null}
        <LoadScript 
          googleMapsApiKey={googleMapsApiKey || ''}
          loadingElement={<div className="w-full h-[400px]" />}
          key={isMapLoaded ? 'loaded' : 'loading'}
        >
          <GoogleMap
            key={`location-picker-map-${isDarkMode ? 'dark' : 'light'}`}
            mapContainerStyle={mapContainerStyle}
            center={mapCenter}
            zoom={hasValidCoordinates ? 15 : 10}
            onClick={handleMapClick}
            onLoad={onMapLoad}
            onUnmount={onMapUnmount}
            options={mapOptions}
          >
            {hasValidCoordinates && (
              <Marker
                position={{
                  lat: parseFloat(lat),
                  lng: parseFloat(lng),
                }}
                draggable={true}
                onDragEnd={(e) => {
                  if (e.latLng) {
                    const newLat = e.latLng.lat().toString();
                    const newLng = e.latLng.lng().toString();
                    onLocationChange(newLat, newLng);
                    reverseGeocode(e.latLng.lat(), e.latLng.lng());
                  }
                }}
              />
            )}
          </GoogleMap>
        </LoadScript>
      </div>

      {/* Coordinates inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="lat" className="block text-xs font-medium text-[#616161] dark:text-[#b0b0b0] mb-1">
            Latitud <span className="text-red-500">*</span>
          </label>
          <input
            id="lat"
            type="text"
            value={lat}
            onChange={handleLatChange}
            required
            disabled
            className="w-full px-3 py-2 text-sm rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#121212] text-[#212121] dark:text-[#ffffff] placeholder:text-[#616161] dark:placeholder:text-[#b0b0b0] focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400"
            placeholder="Ej: 19.4326"
          />
        </div>
        <div>
          <label htmlFor="lng" className="block text-xs font-medium text-[#616161] dark:text-[#b0b0b0] mb-1">
            Longitud <span className="text-red-500">*</span>
          </label>
          <input
            id="lng"
            type="text"
            value={lng}
            onChange={handleLngChange}
            required
            disabled
            className="w-full px-3 py-2 text-sm rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#121212] text-[#212121] dark:text-[#ffffff] placeholder:text-[#616161] dark:placeholder:text-[#b0b0b0] focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400"
            placeholder="Ej: -99.1332"
          />
        </div>
      </div>

      {/* Address fields */}
      <div className="space-y-4">
        <div>
          <label htmlFor="address" className="block text-xs font-medium text-[#616161] dark:text-[#b0b0b0] mb-1">
            Dirección {isGeocoding && <span className="text-orange-500 text-xs">(Obteniendo...)</span>}
          </label>
          <input
            id="address"
            type="text"
            value={localAddress}
            onChange={(e) => {
              setLocalAddress(e.target.value);
              if (onAddressChange) {
                onAddressChange(e.target.value, localCity, localState, localCountry);
              }
            }}
            className="w-full px-3 py-2 text-sm rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#121212] text-[#212121] dark:text-[#ffffff] placeholder:text-[#616161] dark:placeholder:text-[#b0b0b0] focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400"
            placeholder="Dirección"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="city" className="block text-xs font-medium text-[#616161] dark:text-[#b0b0b0] mb-1">
              Ciudad
            </label>
            <input
              id="city"
              type="text"
              value={localCity}
              onChange={(e) => {
                setLocalCity(e.target.value);
                if (onAddressChange) {
                  onAddressChange(localAddress, e.target.value, localState, localCountry);
                }
              }}
              className="w-full px-3 py-2 text-sm rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#121212] text-[#212121] dark:text-[#ffffff] placeholder:text-[#616161] dark:placeholder:text-[#b0b0b0] focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400"
              placeholder="Ciudad"
            />
          </div>
          <div>
            <label htmlFor="state" className="block text-xs font-medium text-[#616161] dark:text-[#b0b0b0] mb-1">
              Estado/Provincia
            </label>
            <input
              id="state"
              type="text"
              value={localState}
              onChange={(e) => {
                setLocalState(e.target.value);
                if (onAddressChange) {
                  onAddressChange(localAddress, localCity, e.target.value, localCountry);
                }
              }}
              className="w-full px-3 py-2 text-sm rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#121212] text-[#212121] dark:text-[#ffffff] placeholder:text-[#616161] dark:placeholder:text-[#b0b0b0] focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400"
              placeholder="Estado/Provincia"
            />
          </div>
          <div>
            <label htmlFor="country" className="block text-xs font-medium text-[#616161] dark:text-[#b0b0b0] mb-1">
              País
            </label>
            <input
              id="country"
              type="text"
              value={localCountry}
              onChange={(e) => {
                setLocalCountry(e.target.value);
                if (onAddressChange) {
                  onAddressChange(localAddress, localCity, localState, e.target.value);
                }
              }}
              className="w-full px-3 py-2 text-sm rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#121212] text-[#212121] dark:text-[#ffffff] placeholder:text-[#616161] dark:placeholder:text-[#b0b0b0] focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400"
              placeholder="País"
            />
          </div>
        </div>
      </div>

      {/* Instructions */}
      <p className="text-xs text-[#616161] dark:text-[#b0b0b0]">
        💡 Haz click en el mapa o arrastra el marcador para seleccionar la ubicación
      </p>
    </div>
  );
}
