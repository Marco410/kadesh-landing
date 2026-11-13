import { ANIMAL_TYPE_LABELS } from './constants';

/**
 * Nombre de un animal para mostrar. Cuando no se sabe, `Animal.name` va vacío (kadesh-back lo deja
 * así y convierte «Sin nombre», «Desconocido», etc.). En lugar de un texto de relleno se describe:
 * «Perra café» en títulos y tarjetas, «esta perra» dentro de una frase. Misma regla que
 * `utils/pet/animalName.ts` de kadesh-back.
 */

type AnimalNameSource = {
  name?: string | null;
  /** `animal_type.name` («dog», «Perro»…). */
  typeName?: string | null;
  sex?: string | null;
  color?: string | null;
};

const fold = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9/?]+/g, ' ')
    .trim();

/** Textos de relleno que la gente (o la web vieja) escribe cuando no sabe el nombre. */
const PLACEHOLDERS = new Set([
  '',
  'sin nombre',
  'sin nombre conocido',
  'desconocido',
  'desconocida',
  'nombre desconocido',
  'no se',
  'no lo se',
  'no se su nombre',
  'no tiene nombre',
  'no tiene',
  'ninguno',
  'unknown',
  'unnamed',
  'n/a',
  'na',
  '?',
]);

export function isUnknownAnimalName(name: string | null | undefined): boolean {
  return PLACEHOLDERS.has(fold(name ?? ''));
}

/** Nombre real o cadena vacía. */
export function knownAnimalName(name: string | null | undefined): string {
  return isUnknownAnimalName(name) ? '' : (name ?? '').trim();
}

type Forms = { m: string; f: string; thisM: string; thisF: string };

const FORMS: Record<string, Forms> = {
  Perro: { m: 'Perro', f: 'Perra', thisM: 'este perro', thisF: 'esta perra' },
  Gato: { m: 'Gato', f: 'Gata', thisM: 'este gato', thisF: 'esta gata' },
  Ave: { m: 'Ave', f: 'Ave', thisM: 'esta ave', thisF: 'esta ave' },
  Pez: { m: 'Pez', f: 'Pez', thisM: 'este pez', thisF: 'este pez' },
  Reptil: { m: 'Reptil', f: 'Reptil', thisM: 'este reptil', thisF: 'este reptil' },
};
const DEFAULT_FORMS: Forms = { m: 'Animal', f: 'Animal', thisM: 'este animal', thisF: 'este animal' };

function formsFor(typeName: string | null | undefined): Forms {
  const label = ANIMAL_TYPE_LABELS[(typeName ?? '').trim().toLowerCase()] ?? '';
  return FORMS[label] ?? DEFAULT_FORMS;
}

/** «café», «negro con blanco»: solo si es corto, para que el título no se vuelva una descripción. */
function shortColor(color: string | null | undefined): string {
  const clean = (color ?? '').replace(/\s+/g, ' ').trim().toLowerCase();
  return clean && clean.length <= 24 ? clean : '';
}

/** Para títulos, tarjetas, carteles y `alt`: el nombre, o «Perra café». */
export function animalDisplayName(animal: AnimalNameSource): string {
  const known = knownAnimalName(animal.name);
  if (known) return known;
  const forms = formsFor(animal.typeName);
  const base = animal.sex === 'female' ? forms.f : forms.m;
  const color = shortColor(animal.color);
  return color ? `${base} ${color}` : base;
}

/** Dentro de una frase: el nombre, o «esta perra» / «este animal». */
export function animalSentenceName(animal: AnimalNameSource): string {
  const known = knownAnimalName(animal.name);
  if (known) return known;
  const forms = formsFor(animal.typeName);
  return animal.sex === 'female' ? forms.thisF : forms.thisM;
}

/** Datos del nombre a partir de un animal de la API (tipo directo o el de su raza). */
export function animalNameSource(animal: {
  name?: string | null;
  sex?: string | null;
  color?: string | null;
  animal_type?: { name?: string | null } | null;
  animal_breed?: { animal_type?: { name?: string | null } | null } | null;
}): AnimalNameSource {
  return {
    name: animal.name,
    sex: animal.sex,
    color: animal.color,
    typeName: animal.animal_type?.name || animal.animal_breed?.animal_type?.name || null,
  };
}

/** Primera letra en mayúscula (para empezar una frase con «Esta perra…»). */
export function capitalizeFirst(text: string): string {
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
}
