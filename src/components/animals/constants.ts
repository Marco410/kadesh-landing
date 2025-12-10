export const ANIMAL_LOGS_OPTIONS = [
  { label: "Registrado", value: "register" },
  { label: "Adoptado", value: "adopted" },
  { label: "Abandonado", value: "abandoned" },
  { label: "Rescatado", value: "rescued" },
  { label: "En familia", value: "in_family" },
  { label: "Perdido", value: "lost" },
  { label: "Encontrado", value: "found" },
];

export const ANIMAL_SEX_OPTIONS = [
  { label: "Macho", value: "male" },
  { label: "Hembra", value: "female" },
  { label: "Desconocido", value: "unknown" },
];

// Mapeo de valores de AnimalType a labels en español
export const ANIMAL_TYPE_LABELS: Record<string, string> = {
  dog: "Perro",
  cat: "Gato",
  bird: "Ave",
  fish: "Pez",
  reptil: "Reptil",
  mammal: "Mamífero",
};

// Mapeo de valores a emojis
export const ANIMAL_TYPE_ICONS: Record<string, string> = {
  dog: "🐶",
  cat: "🐱",
  bird: "🐦",
  fish: "🐠",
  reptil: "🦎",
  mammal: "🦁",
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'register':
      return '#6b7280'; // gray-500 - Registrado
    case 'adopted':
      return '#a855f7'; // purple-500 - Adoptado
    case 'abandoned':
      return '#dc2626'; // red-600 - Abandonado
    case 'rescued':
      return '#f97316'; // orange-500 - Rescatado
    case 'in_family':
      return '#3b82f6'; // blue-500 - En familia
    case 'lost':
      return '#ef4444'; // red-500 - Perdido
    case 'found':
      return '#10b981'; // green-500 - Encontrado
    default:
      return '#6b7280'; // gray-500
  }
};


// Dark mode map styles
export const darkMapStyles = [
  { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#c9733e' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#263c3f' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6b9a76' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#38414e' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#212a37' }],
  },
  /* {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#9ca5b3' }],
  }, */
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#746855' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1f2835' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#f3d19c' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.icon',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#2f3948' }],
  },
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }],
  },
 /* maps */
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#515c6d' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#17263c' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
];

// Light mode map styles (minimal, mostly default)
export const lightMapStyles = [
  {
    featureType: 'poi',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
];
