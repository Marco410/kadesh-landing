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