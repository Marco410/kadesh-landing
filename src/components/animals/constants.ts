export const ANIMAL_LOGS_OPTIONS = [
  { label: "Registrado", value: "register" },
  { label: "Adoptado", value: "adopted" },
  { label: "Abandonado", value: "abandoned" },
  { label: "Rescatado", value: "rescued" },
  { label: "En familia", value: "in_family" },
  { label: "Perdido", value: "lost" },
  { label: "Encontrado", value: "found" },
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