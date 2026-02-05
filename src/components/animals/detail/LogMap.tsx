"use client";

import { useMemo, useCallback, useEffect, useState } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { useTheme } from 'next-themes';
import { darkMapStyles, lightMapStyles, getStatusColor } from '../constants';

interface LogMapProps {
  lat: number;
  lng: number;
  status: string;
  height?: string;
}

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

export default function LogMap({ lat, lng, status, height = '300px' }: LogMapProps) {
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const { resolvedTheme } = useTheme();
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [mounted, setMounted] = useState(false);

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

  const onLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Validate and convert coordinates to numbers
  const validLat = useMemo(() => {
    const numLat = typeof lat === 'string' ? parseFloat(lat) : lat;
    return typeof numLat === 'number' && !isNaN(numLat) && isFinite(numLat) ? numLat : null;
  }, [lat]);

  const validLng = useMemo(() => {
    const numLng = typeof lng === 'string' ? parseFloat(lng) : lng;
    return typeof numLng === 'number' && !isNaN(numLng) && isFinite(numLng) ? numLng : null;
  }, [lng]);

  const mapCenter = useMemo(() => {
    if (validLat !== null && validLng !== null) {
      return { lat: validLat, lng: validLng };
    }
    // Default center (Ciudad de México) if coordinates are invalid
    return { lat: 19.4326, lng: -99.1332 };
  }, [validLat, validLng]);

  const createMarkerIcon = useCallback((color: string): string | google.maps.Icon => {
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

    // Use Google Maps API classes - they should be available when LoadScript loads
    if (typeof window !== 'undefined' && window.google?.maps) {
      const Size = window.google.maps.Size;
      const Point = window.google.maps.Point;
      
      if (Size && Point) {
        return {
          url: dataUri,
          scaledSize: new Size(40, 40),
          anchor: new Point(20, 36.67),
        };
      }
    }

    // Fallback: return just the URL string (simpler, but less control)
    return dataUri;
  }, []);

  if (!googleMapsApiKey) {
    return (
      <div 
        className="w-full bg-[#f5f5f5] dark:bg-[#1e1e1e] rounded-lg flex items-center justify-center"
        style={{ height }}
      >
        <p className="text-[#616161] dark:text-[#b0b0b0] text-sm">
          Google Maps API key no configurada
        </p>
      </div>
    );
  }


  const mapOptions = useMemo(() => ({
    styles: isDarkMode ? darkMapStyles : lightMapStyles,
    disableDefaultUI: true,
    zoomControl: true,
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: false,
  }), [isDarkMode]);

  if (validLat === null || validLng === null) {
    return (
      <div 
        className="w-full bg-[#f5f5f5] dark:bg-[#1e1e1e] rounded-lg flex items-center justify-center"
        style={{ height }}
      >
        <p className="text-[#616161] dark:text-[#b0b0b0] text-sm">
          Coordenadas inválidas
        </p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-lg shadow-lg" style={{ height }}>
      <LoadScript googleMapsApiKey={googleMapsApiKey} loadingElement={<div className="w-full animate-pulse bg-[#f5f5f5] dark:bg-[#1e1e1e]" style={{ height }} />}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={mapCenter}
          zoom={15}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={mapOptions}
        >
          <Marker
            position={{ lat: validLat, lng: validLng }}
            icon={createMarkerIcon(getStatusColor(status))}
          />
        </GoogleMap>
      </LoadScript>
    </div>
  );
}



