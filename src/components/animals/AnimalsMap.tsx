"use client";

import { useMemo, useCallback } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { LostAnimal } from './types';

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

const getStatusColor = (status: string) => {
  switch (status) {
    case 'perdido':
      return '#ef4444'; // red-500
    case 'encontrado':
      return '#10b981'; // green-500
    case 'en_adopcion':
      return '#3b82f6'; // blue-500
    default:
      return '#6b7280'; // gray-500
  }
};

export default function AnimalsMap({ 
  animals, 
  selectedAnimal, 
  onAnimalClick,
  height = '600px'
}: AnimalsMapProps) {
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

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

  // Create custom marker icon (only when google.maps is available)
  const createMarkerIcon = useCallback((color: string) => {
    if (typeof window !== 'undefined' && window.google?.maps) {
      return {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: color,
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
      };
    }
    return undefined; // Use default marker if google.maps not available
  }, []);

  if (!googleMapsApiKey) {
    return (
      <div 
        className="w-full bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center"
        style={{ height }}
      >
        <p className="text-gray-600 dark:text-gray-400">
          Google Maps API key no configurada. Por favor configura NEXT_PUBLIC_GOOGLE_MAPS_API_KEY en tus variables de entorno.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden shadow-lg" style={{ height }}>
      <LoadScript googleMapsApiKey={googleMapsApiKey}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={mapCenter}
          zoom={animals.length > 1 ? 6 : 9}
          options={{
            styles: [
              {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }],
              },
            ],
            disableDefaultUI: false,
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: true,
          }}
        >
          {animals
            .filter(animal => animal.latitude !== undefined && animal.longitude !== undefined)
            .map((animal) => (
              <Marker
                key={animal.id}
                position={{
                  lat: animal.latitude!,
                  lng: animal.longitude!,
                }}
                onClick={() => handleMarkerClick(animal)}
                icon={createMarkerIcon(getStatusColor(animal.status))}
              >
                {selectedAnimal?.id === animal.id && (
                  <InfoWindow
                    position={{
                      lat: animal.latitude!,
                      lng: animal.longitude!,
                    }}
                    onCloseClick={() => onAnimalClick?.(null as any)}
                  >
                    <div className="p-2">
                      <h3 className="font-bold text-lg mb-1">{animal.name}</h3>
                      <p className="text-sm text-gray-600">{animal.type}</p>
                      {animal.breed && (
                        <p className="text-sm text-gray-500">{animal.breed}</p>
                      )}
                      <p className="text-sm text-gray-600 mt-1">{animal.location}</p>
                    </div>
                  </InfoWindow>
                )}
              </Marker>
            ))}
        </GoogleMap>
      </LoadScript>
    </div>
  );
}
