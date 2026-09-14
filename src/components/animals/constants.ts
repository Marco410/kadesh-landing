export const ANIMAL_LOGS_OPTIONS = [
  { label: "Registrado", value: "register" },
  { label: "Adoptado", value: "adopted" },
  { label: "Abandonado", value: "abandoned" },
  { label: "Rescatado", value: "rescued" },
  { label: "En familia", value: "in_family" },
  { label: "Perdido", value: "lost" },
  { label: "Encontrado", value: "found" },
  { label: "En adopción", value: "in_adoption" },
];

/** Estados que se pueden elegir al dar de alta un animal. */
export const ANIMAL_REPORT_STATUS_VALUES = [
  'abandoned',
  'found',
  'lost',
  'rescued',
  'in_adoption',
] as const;

export type AnimalReportStatus = (typeof ANIMAL_REPORT_STATUS_VALUES)[number];

export function isAnimalReportStatus(
  value: string | null | undefined
): value is AnimalReportStatus {
  return (
    !!value &&
    (ANIMAL_REPORT_STATUS_VALUES as readonly string[]).includes(value)
  );
}

export const ANIMAL_SEX_OPTIONS = [
  { label: "Macho", value: "male" },
  { label: "Hembra", value: "female" },
  { label: "Desconocido", value: "unknown" },
];

// Mapeo de valores de AnimalType a labels en español
export const ANIMAL_TYPE_LABELS: Record<string, string> = {
  dog: "Perro",
  perro: "Perro",
  cat: "Gato",
  gato: "Gato",
  bird: "Ave",
  ave: "Ave",
  fish: "Pez",
  pez: "Pez",
  reptil: "Reptil",
  mammal: "Mamífero",
  mamifero: "Mamífero",
  mamífero: "Mamífero",
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

/** Estatus que el visitante busca en el directorio (mismos trabajos del hero). */
export const DIRECTORY_STATUS_PRIMARY = [
  { label: 'Perdido', value: 'lost' },
  { label: 'Encontrado', value: 'found' },
  { label: 'En adopción', value: 'in_adoption' },
] as const;

/** Estatus extra para rescate; no saturan la fila principal. */
export const DIRECTORY_STATUS_MORE = [
  { label: 'Abandonado', value: 'abandoned' },
  { label: 'Rescatado', value: 'rescued' },
] as const;

const TYPE_PLURAL: Record<string, string> = {
  perro: 'perros',
  dog: 'perros',
  gato: 'gatos',
  cat: 'gatos',
  ave: 'aves',
  bird: 'aves',
  pez: 'peces',
  fish: 'peces',
  reptil: 'reptiles',
  mammal: 'mamíferos',
  mamifero: 'mamíferos',
  conejo: 'conejos',
  rabbit: 'conejos',
};

const STATUS_PLURAL: Record<string, string> = {
  lost: 'perdidos',
  found: 'encontrados',
  in_adoption: 'en adopción',
  abandoned: 'abandonados',
  rescued: 'rescatados',
  adopted: 'adoptados',
};

export function emptyDirectoryHeadline(
  filters: { type?: string | null; status?: string | null },
  radiusKm: number
): string {
  const typeKey = filters.type?.toLowerCase() ?? '';
  const typePhrase =
    typeKey && TYPE_PLURAL[typeKey] ? TYPE_PLURAL[typeKey] : null;
  const statusPhrase = filters.status ? STATUS_PLURAL[filters.status] ?? null : null;

  if (typePhrase && statusPhrase) {
    return `No hay ${typePhrase} ${statusPhrase} en ${radiusKm} km`;
  }
  if (statusPhrase) {
    return `No hay animales ${statusPhrase} en ${radiusKm} km`;
  }
  if (typePhrase) {
    return `No hay ${typePhrase} en ${radiusKm} km`;
  }
  return `No hay reportes en ${radiusKm} km`;
}

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
    case 'in_adoption':
      return '#9333ea'; // purple-500 - En adopción
    default:
      return '#6b7280'; // gray-500
  }
};

export const getStatusLabel = (status: string) => {
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
    case 'in_adoption':
      return 'En adopción';
    default:
      return status;
  }
};

export const statusIcons: Record<string, string> = {
  abandoned: '🚫',
  found: '✅',
  lost: '🔍',
  rescued: '🆘',
  in_adoption: '💖',
};

export const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    perro: 'Perro',
    gato: 'Gato',
    conejo: 'Conejo',
    ave: 'Ave',
    otro: 'Otro',
  };
  return labels[type] || type;
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
