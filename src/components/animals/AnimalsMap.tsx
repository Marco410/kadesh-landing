"use client";

import { useMemo, useCallback, useEffect, useState } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import { LostAnimal } from './types';
import { darkMapStyles, getStatusColor, lightMapStyles } from './constants';

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'register':
      return 'Registrado';
    case 'adopted':
      return 'Adoptado';
    case 'abandoned':
      return 'Abandonado';
    case 'rescued':
      return 'Rescatado';
    case 'in_family':
      return 'En familia';
    case 'lost':
      return 'Perdido';
    case 'found':
      return 'Encontrado';
    default:
      return status;
  }
};

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    perro: 'Perro',
    gato: 'Gato',
    conejo: 'Conejo',
    ave: 'Ave',
    otro: 'Otro',
  };
  return labels[type] || type;
};

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

  // Wait for theme to be resolved
  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine if dark mode is active
  const isDarkMode = mounted && resolvedTheme === 'dark';

  // Update map styles when dark mode changes
  useEffect(() => {
    if (map && mounted) {
      const newStyles = isDarkMode ? darkMapStyles : lightMapStyles;
      map.setOptions({
        styles: newStyles,
      });
    }
  }, [isDarkMode, map, mounted]);

  // Inject styles for InfoWindow dark mode and apply when InfoWindow opens
  useEffect(() => {
    if (!mounted) return;

    const styleId = 'google-maps-infowindow-dark-mode';
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;

    const applyDarkModeStyles = () => {
      if (isDarkMode) {
        if (!styleElement) {
          styleElement = document.createElement('style');
          styleElement.id = styleId;
          document.head.appendChild(styleElement);
        }
        styleElement.textContent = `
          .gm-style .gm-style-iw-c {
            background-color: #1e1e1e !important;
            border-radius: 12px !important;
            padding: 0 !important;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5), 0 2px 4px rgba(0, 0, 0, 0.3) !important;
          }
          .gm-style .gm-style-iw-d {
            background-color: #1e1e1e !important;
            overflow: hidden !important;
            border-radius: 12px !important;
          }
          .gm-style .gm-style-iw {
            background-color: #1e1e1e !important;
            border-radius: 12px !important;
          }
          .gm-style .gm-style-iw-t::after {
            background-color: #1e1e1e !important;
            border-color: #1e1e1e transparent transparent transparent !important;
          }
          .gm-style .gm-ui-hover-effect,
          .gm-style-iw .gm-ui-hover-effect,
          .gm-style-iw-c .gm-ui-hover-effect {
            opacity: 1 !important;
            top: 10px !important;
            right: 10px !important;
            width: 36px !important;
            height: 36px !important;
            min-width: 36px !important;
            min-height: 36px !important;
            max-width: 36px !important;
            max-height: 36px !important;
            background-color: rgba(255, 255, 255, 0.2) !important;
            border-radius: 50% !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            transition: all 0.2s ease !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3) !important;
            position: absolute !important;
          }
          .gm-style .gm-ui-hover-effect:hover,
          .gm-style-iw .gm-ui-hover-effect:hover,
          .gm-style-iw-c .gm-ui-hover-effect:hover {
            opacity: 1 !important;
            background-color: rgba(255, 255, 255, 0.3) !important;
            transform: scale(1.1) !important;
          }
          .gm-style .gm-ui-hover-effect > span,
          .gm-style-iw .gm-ui-hover-effect > span,
          .gm-style-iw-c .gm-ui-hover-effect > span {
            background-color: #ffffff !important;
            width: 18px !important;
            height: 2px !important;
            min-width: 18px !important;
            border-radius: 1px !important;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3) !important;
            display: block !important;
            position: absolute !important;
            top: 50% !important;
            left: 50% !important;
            margin-left: -9px !important;
            margin-top: -1px !important;
            font-size: 0 !important;
            text-indent: -9999px !important;
            overflow: hidden !important;
          }
          .gm-style .gm-ui-hover-effect > span:first-child,
          .gm-style-iw .gm-ui-hover-effect > span:first-child,
          .gm-style-iw-c .gm-ui-hover-effect > span:first-child {
            transform: rotate(45deg) !important;
          }
          .gm-style .gm-ui-hover-effect > span:last-child,
          .gm-style-iw .gm-ui-hover-effect > span:last-child,
          .gm-style-iw-c .gm-ui-hover-effect > span:last-child {
            transform: rotate(-45deg) !important;
          }
        `;
      } else {
        if (styleElement) {
          styleElement.remove();
        }
      }
    };

    applyDarkModeStyles();

    // Function to force apply close button styles
    const forceCloseButtonStyles = () => {
      const closeButtons = document.querySelectorAll('.gm-ui-hover-effect');
      closeButtons.forEach((el: any) => {
        if (el) {
          // Apply styles based on theme
          el.style.setProperty('position', 'absolute', 'important');
          el.style.setProperty('top', '10px', 'important');
          el.style.setProperty('right', '10px', 'important');
          el.style.setProperty('width', isDarkMode ? '36px' : '38px', 'important');
          el.style.setProperty('height', isDarkMode ? '36px' : '38px', 'important');
          el.style.setProperty('min-width', isDarkMode ? '36px' : '38px', 'important');
          el.style.setProperty('min-height', isDarkMode ? '36px' : '38px', 'important');
          el.style.setProperty('max-width', isDarkMode ? '36px' : '38px', 'important');
          el.style.setProperty('max-height', isDarkMode ? '36px' : '38px', 'important');
          el.style.setProperty('border-radius', '50%', 'important');
          el.style.setProperty('display', 'block', 'important');
          el.style.setProperty('margin', '0', 'important');
          el.style.setProperty('padding', '0', 'important');
          el.style.setProperty('z-index', '1000', 'important');
          
          if (isDarkMode) {
            el.style.setProperty('opacity', '1', 'important');
            el.style.setProperty('background-color', 'rgba(255, 255, 255, 0.2)', 'important');
            el.style.setProperty('box-shadow', '0 2px 4px rgba(0, 0, 0, 0.3)', 'important');
            el.style.setProperty('border', 'none', 'important');
          } else {
            el.style.setProperty('background-color', 'rgba(255, 255, 255, 0.95)', 'important');
            el.style.setProperty('border', '1px solid rgba(0, 0, 0, 0.1)', 'important');
            el.style.setProperty('box-shadow', '0 2px 6px rgba(0, 0, 0, 0.2)', 'important');
          }
          
          // Make container relative for absolute positioned spans (but keep absolute for positioning)
          // We'll use a wrapper approach: the button itself stays absolute, but we ensure spans are positioned correctly
          
          // Hide any text content that might be showing
          const allChildren = Array.from(el.childNodes);
          allChildren.forEach((node: any) => {
            if (node.nodeType === 3 && node.textContent && node.textContent.trim()) {
              // Remove text nodes
              node.parentNode?.removeChild(node);
            } else if (node.nodeType === 1 && node.tagName && node.tagName.toLowerCase() !== 'span') {
              // Hide non-span elements that might contain text
              const text = node.textContent || node.innerText;
              if (text && text.trim() && !text.trim().match(/^[×xX\s;]+$/)) {
                node.style.setProperty('display', 'none', 'important');
              }
            }
          });
          
          // Apply styles to spans (the X icon) - Google Maps uses 2 spans rotated to form X
          const spans = el.querySelectorAll('span');
          if (spans.length >= 2) {
            spans.forEach((span: any, index: number) => {
              // Clear any text content
              if (span.textContent) {
                span.textContent = '';
              }
              if (span.innerText) {
                span.innerText = '';
              }
              
              span.style.setProperty('display', 'block', 'important');
              span.style.setProperty('width', '18px', 'important');
              span.style.setProperty('height', '2px', 'important');
              span.style.setProperty('min-width', '18px', 'important');
              span.style.setProperty('border-radius', '1px', 'important');
              span.style.setProperty('position', 'absolute', 'important');
              span.style.setProperty('top', '50%', 'important');
              span.style.setProperty('left', '50%', 'important');
              span.style.setProperty('margin-left', '-9px', 'important');
              span.style.setProperty('margin-top', '-1px', 'important');
              span.style.setProperty('font-size', '0', 'important');
              span.style.setProperty('line-height', '0', 'important');
              span.style.setProperty('text-indent', '-9999px', 'important');
              span.style.setProperty('overflow', 'hidden', 'important');
              span.style.setProperty('white-space', 'nowrap', 'important');
              span.style.setProperty('color', 'transparent', 'important');
              
              // Rotate spans to form X: first span 45deg, second span -45deg
              if (index === 0) {
                span.style.setProperty('transform', 'rotate(45deg)', 'important');
              } else if (index === 1) {
                span.style.setProperty('transform', 'rotate(-45deg)', 'important');
              } else {
                // Hide any additional spans
                span.style.setProperty('display', 'none', 'important');
              }
              
              if (isDarkMode) {
                span.style.setProperty('background-color', '#ffffff', 'important');
                span.style.setProperty('box-shadow', '0 1px 2px rgba(0, 0, 0, 0.3)', 'important');
              } else {
                span.style.setProperty('background-color', '#1f2937', 'important');
                span.style.setProperty('box-shadow', '0 1px 2px rgba(0, 0, 0, 0.1)', 'important');
              }
            });
          } else if (spans.length === 0) {
            // If no spans, Google Maps might be using a different structure
            // Try to find and style any elements that might form the X
            const allElements = el.querySelectorAll('*');
            allElements.forEach((elem: any) => {
              if (elem.tagName && elem.tagName.toLowerCase() !== 'span') {
                const text = elem.textContent || elem.innerText;
                if (text && (text.includes('x') || text.includes('×') || text.includes('X'))) {
                  elem.style.setProperty('display', 'none', 'important');
                }
              }
            });
          }
        }
      });
    };

    // Watch for InfoWindow creation and reapply styles
    const observer = new MutationObserver(() => {
      if (isDarkMode) {
        applyDarkModeStyles();
      }
      // Force style application on InfoWindow elements
      setTimeout(() => {
        const infoWindows = document.querySelectorAll('.gm-style-iw-c, .gm-style-iw-d, .gm-style-iw');
        infoWindows.forEach((el: any) => {
          if (el && isDarkMode) {
            el.style.setProperty('background-color', '#1e1e1e', 'important');
          }
        });
        forceCloseButtonStyles();
      }, 50);
      
      // Also apply immediately
      forceCloseButtonStyles();
    });

    // Also use interval to continuously apply styles while InfoWindow is open
    const styleInterval = setInterval(() => {
      if (selectedAnimal) {
        forceCloseButtonStyles();
      }
    }, 200);

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
      clearInterval(styleInterval);
      const element = document.getElementById(styleId);
      if (element) {
        element.remove();
      }
    };
  }, [isDarkMode, mounted, selectedAnimal]);

  const onLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Apply close button styles when InfoWindow opens
  useEffect(() => {
    if (selectedAnimal && mounted) {
      // Apply styles immediately and then with intervals
      const applyStyles = () => {
        const closeButtons = document.querySelectorAll('.gm-ui-hover-effect');
        closeButtons.forEach((el: any) => {
          if (el) {
            el.style.setProperty('position', 'absolute', 'important');
            el.style.setProperty('top', '10px', 'important');
            el.style.setProperty('right', '10px', 'important');
            el.style.setProperty('width', isDarkMode ? '36px' : '38px', 'important');
            el.style.setProperty('height', isDarkMode ? '36px' : '38px', 'important');
            el.style.setProperty('min-width', isDarkMode ? '36px' : '38px', 'important');
            el.style.setProperty('min-height', isDarkMode ? '36px' : '38px', 'important');
            el.style.setProperty('max-width', isDarkMode ? '36px' : '38px', 'important');
            el.style.setProperty('max-height', isDarkMode ? '36px' : '38px', 'important');
            el.style.setProperty('border-radius', '50%', 'important');
            el.style.setProperty('display', 'block', 'important');
            el.style.setProperty('margin', '0', 'important');
            el.style.setProperty('padding', '0', 'important');
            el.style.setProperty('z-index', '1000', 'important');
            
            if (isDarkMode) {
              el.style.setProperty('opacity', '1', 'important');
              el.style.setProperty('background-color', 'rgba(255, 255, 255, 0.2)', 'important');
              el.style.setProperty('box-shadow', '0 2px 4px rgba(0, 0, 0, 0.3)', 'important');
              el.style.setProperty('border', 'none', 'important');
            } else {
              el.style.setProperty('background-color', 'rgba(255, 255, 255, 0.95)', 'important');
              el.style.setProperty('border', '1px solid rgba(0, 0, 0, 0.1)', 'important');
              el.style.setProperty('box-shadow', '0 2px 6px rgba(0, 0, 0, 0.2)', 'important');
            }
            
            // Hide any text content that might be showing
            const allChildren = Array.from(el.childNodes);
            allChildren.forEach((node: any) => {
              if (node.nodeType === 3 && node.textContent && node.textContent.trim()) {
                // Remove text nodes
                node.parentNode?.removeChild(node);
              } else if (node.nodeType === 1 && node.tagName && node.tagName.toLowerCase() !== 'span') {
                // Hide non-span elements that might contain text
                const text = node.textContent || node.innerText;
                if (text && text.trim() && !text.trim().match(/^[×xX\s;]+$/)) {
                  node.style.setProperty('display', 'none', 'important');
                }
              }
            });
            
            const spans = el.querySelectorAll('span');
            if (spans.length >= 2) {
              spans.forEach((span: any, index: number) => {
                // Clear any text content
                if (span.textContent) {
                  span.textContent = '';
                }
                if (span.innerText) {
                  span.innerText = '';
                }
                
                span.style.setProperty('display', 'block', 'important');
                span.style.setProperty('width', '18px', 'important');
                span.style.setProperty('height', '2px', 'important');
                span.style.setProperty('min-width', '18px', 'important');
                span.style.setProperty('border-radius', '1px', 'important');
                span.style.setProperty('position', 'absolute', 'important');
                span.style.setProperty('top', '50%', 'important');
                span.style.setProperty('left', '50%', 'important');
                span.style.setProperty('margin-left', '-9px', 'important');
                span.style.setProperty('margin-top', '-1px', 'important');
                span.style.setProperty('font-size', '0', 'important');
                span.style.setProperty('line-height', '0', 'important');
                span.style.setProperty('text-indent', '-9999px', 'important');
                span.style.setProperty('overflow', 'hidden', 'important');
                span.style.setProperty('white-space', 'nowrap', 'important');
                span.style.setProperty('color', 'transparent', 'important');
                
                // Rotate spans to form X: first span 45deg, second span -45deg
                if (index === 0) {
                  span.style.setProperty('transform', 'rotate(45deg)', 'important');
                } else if (index === 1) {
                  span.style.setProperty('transform', 'rotate(-45deg)', 'important');
                } else {
                  // Hide any additional spans
                  span.style.setProperty('display', 'none', 'important');
                }
                
                if (isDarkMode) {
                  span.style.setProperty('background-color', '#ffffff', 'important');
                  span.style.setProperty('box-shadow', '0 1px 2px rgba(0, 0, 0, 0.3)', 'important');
                } else {
                  span.style.setProperty('background-color', '#1f2937', 'important');
                  span.style.setProperty('box-shadow', '0 1px 2px rgba(0, 0, 0, 0.1)', 'important');
                }
              });
            } else if (spans.length === 0) {
              // If no spans, Google Maps might be using a different structure
              // Try to find and hide text elements
              const allElements = el.querySelectorAll('*');
              allElements.forEach((elem: any) => {
                if (elem.tagName && elem.tagName.toLowerCase() !== 'span') {
                  const text = elem.textContent || elem.innerText;
                  if (text && (text.includes('x') || text.includes('×') || text.includes('X'))) {
                    elem.style.setProperty('display', 'none', 'important');
                  }
                }
              });
            }
          }
        });
      };

      // Apply immediately
      setTimeout(applyStyles, 50);
      setTimeout(applyStyles, 150);
      setTimeout(applyStyles, 300);
      
      // Apply periodically while InfoWindow is open
      const interval = setInterval(applyStyles, 300);
      
      return () => {
        clearInterval(interval);
      };
    }
  }, [selectedAnimal, isDarkMode, mounted]);

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

  // Create custom marker icon using location.svg as base, replacing circle with paw print
  const createMarkerIcon = useCallback((color: string) => {
    // Path from location.svg - the teardrop/pin shape (exact path from the SVG)
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

    // Create the complete SVG - using original viewBox for proper scaling
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

    // Convert SVG to data URI
    const encodedSvg = encodeURIComponent(svg);
    const dataUri = `data:image/svg+xml;charset=UTF-8,${encodedSvg}`;

    // Check if Google Maps is loaded - it should be since we're inside LoadScript
    if (typeof window !== 'undefined' && window.google?.maps) {
      return {
        url: dataUri,
        scaledSize: new window.google.maps.Size(40, 40),
        anchor: new window.google.maps.Point(20, 36.67),
      };
    }

    return dataUri;
  }, []);

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
    <div className="w-full overflow-hidden shadow-lg" style={{ height }}>
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
                    <div 
                      style={{
                        width: '280px',
                        maxWidth: '100%',
                        backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff',
                        color: isDarkMode ? '#ffffff' : '#212121',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        boxShadow: isDarkMode 
                          ? '0 4px 12px rgba(0, 0, 0, 0.5), 0 2px 4px rgba(0, 0, 0, 0.3)' 
                          : '0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1)',
                      }}
                    >
                      {/* Image */}
                      {animal.image?.url && (
                        <div 
                          style={{
                            position: 'relative',
                            width: '100%',
                            height: '180px',
                            overflow: 'hidden',
                            backgroundColor: isDarkMode ? '#2a2a2a' : '#e5e7eb',
                          }}
                        >
                          <Image
                            src={animal.image.url}
                            alt={animal.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      )}
                      
                      {/* Content */}
                      <div style={{ padding: '16px' }}>
                        {/* Name and Status */}
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'flex-start', 
                          justifyContent: 'space-between', 
                          gap: '10px', 
                          marginBottom: '10px' 
                        }}>
                          <h3 style={{ 
                            fontWeight: '700', 
                            fontSize: '20px', 
                            lineHeight: '1.2',
                            color: isDarkMode ? '#ffffff' : '#111827',
                            flex: 1,
                            margin: 0,
                            letterSpacing: '-0.01em',
                          }}>
                            {animal.name}
                          </h3>
                          <span
                            style={{
                              padding: '5px 10px',
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: '700',
                              color: '#ffffff',
                              backgroundColor: getStatusColor(animal.status),
                              flexShrink: 0,
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                            }}
                          >
                            {getStatusLabel(animal.status)}
                          </span>
                        </div>

                        {/* Type and Breed */}
                        <div style={{ marginBottom: '10px' }}>
                          <p style={{ 
                            fontSize: '15px', 
                            fontWeight: '500',
                            color: isDarkMode ? '#e5e7eb' : '#374151',
                            margin: 0,
                            lineHeight: '1.4',
                          }}>
                            {getTypeLabel(animal.type)}
                            {animal.breed && (
                              <span style={{ 
                                color: isDarkMode ? '#9ca3af' : '#6b7280',
                                fontWeight: '400',
                              }}> • {animal.breed}</span>
                            )}
                          </p>
                        </div>

                        {/* Distance */}
                        {animal.distance !== undefined && animal.distance !== null && (
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '6px', 
                            marginBottom: '10px',
                            padding: '6px 0',
                          }}>
                            <span style={{ fontSize: '14px', lineHeight: 1 }}>🚗</span>
                            <p style={{ 
                              fontSize: '13px',
                              fontWeight: '500',
                              color: isDarkMode ? '#d1d5db' : '#4b5563',
                              margin: 0,
                            }}>
                              {animal.distance < 1 
                                ? `${Math.round(animal.distance * 1000)} m` 
                                : `${animal.distance.toFixed(1)} km`}
                            </p>
                          </div>
                        )}

                        {/* Location */}
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'flex-start', 
                          gap: '6px', 
                          marginTop: '12px', 
                          paddingTop: '12px',
                          borderTop: `1px solid ${isDarkMode ? '#3a3a3a' : '#e5e7eb'}`,
                        }}>
                          <span style={{ 
                            fontSize: '13px', 
                            marginTop: '1px',
                            flexShrink: 0,
                          }}>📍</span>
                          <p style={{ 
                            fontSize: '12px',
                            fontWeight: '400',
                            color: isDarkMode ? '#9ca3af' : '#6b7280',
                            lineHeight: '1.5',
                            margin: 0,
                          }}>
                            {animal.location}
                          </p>
                        </div>
                      </div>
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
