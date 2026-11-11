---
estado: pendiente
fecha: 2026-11-10
origen: kadesh-landing@develop (backend: kadesh-back@develop)
feature: events
---

# Prompt para kadesh-pet-mobile: eventos — «Para qué animales» con los tipos de animal

## Contexto
Al publicar o editar un evento, «Para qué animales (opcional)» solo ofrecía Perros, Gatos y Otros. Ahora ofrece los mismos tipos de animal que un reporte: Perros, Gatos, Aves, Peces, Reptiles y Mamíferos. «Otros» desaparece: no decía para qué animales era el evento, y así se puede anunciar, por ejemplo, una jornada para aves o reptiles.

**Si la app todavía no tiene eventos**, los prompts `2026-11-04-eventos-ver-y-asistir.md` y `2026-11-04-eventos-publicar.md` ya traen la lista nueva. Implementa esos y marca este como `implementado` junto con ellos.

## Qué implementar en la app
- **Formulario de evento (publicar y editar)**: casillas o chips de selección múltiple, opcionales, con los seis tipos en este orden: Perros, Gatos, Aves, Peces, Reptiles, Mamíferos. Sin elegir ninguno = el evento es para cualquier animal.
- **Al editar un evento viejo**: si `species` trae `other`, no lo marques ni lo reenvíes. Filtra `species` a los seis valores al precargar el formulario y antes de mandar `updateMyPetEvent`. El backend lo descarta de todos modos, pero así el formulario no guarda un valor que no se ve.
- **Ficha del evento**: «Para: Perros, Gatos, Aves» (etiquetas en plural, en el orden de la lista, separadas por coma). Si un evento viejo tiene `other`, muestra «Otros» al final. Si `species` viene vacío o `null`, no muestres la línea.

## GraphQL
No hay operaciones nuevas: `species` ya existía en `PetEvent` y en `PetEventInput`. Lo que cambia son los valores que acepta el backend.

```graphql
# Lectura: el campo ya está en la query de la ficha
query PetEventBySlug($slug: String!) {
  petEvent(where: { slug: $slug }) {
    id
    slug
    title
    species        # [String!]: "dog" | "cat" | "bird" | "fish" | "reptil" | "mammal" (eventos viejos: "other")
    # …resto de campos de la ficha
  }
}

# Escritura: mismo input de siempre
mutation SubmitPetEvent($input: PetEventInput!) {
  submitPetEvent(input: $input) { success message event { id slug status } }
}

mutation UpdateMyPetEvent($id: ID!, $input: PetEventInput!) {
  updateMyPetEvent(id: $id, input: $input) { success message event { id slug status } }
}

# input PetEventInput { …  species: [String!]  … }
```

Tipos:

```ts
/** Mismos valores que `AnimalType.name` / `ANIMAL_TYPE_OPTIONS` del backend, en este orden. */
export const EVENT_SPECIES = [
  { value: 'dog', label: 'Perros' },
  { value: 'cat', label: 'Gatos' },
  { value: 'bird', label: 'Aves' },
  { value: 'fish', label: 'Peces' },
  { value: 'reptil', label: 'Reptiles' },
  { value: 'mammal', label: 'Mamíferos' },
] as const;

export type EventSpecies = (typeof EVENT_SPECIES)[number]['value'];

/** Valor viejo que solo se muestra; ya no se ofrece ni se manda. */
export const LEGACY_EVENT_SPECIES_LABEL: Record<string, string> = { other: 'Otros' };

// En PetEvent (lectura): species: string[] | null
// En PetEventInput (escritura): species: EventSpecies[]
```

## Reglas y constantes
- Valores aceptados por el backend: `dog`, `cat`, `bird`, `fish`, `reptil` (sin «e»), `mammal`. Son los mismos que usa la app para el tipo de animal de un reporte y para las especies de un espacio de rescate.
- El backend (`submitPetEvent` / `updateMyPetEvent`) quita en silencio los valores que no reconoce y los repetidos. No responde con error.
- El campo es opcional. Vacío = cualquier animal.
- Etiquetas en plural y con mayúscula inicial en el formulario y en la ficha.

## Referencia web
- `src/components/events/constants.ts`: `EVENT_SPECIES`, `knownEventSpecies`, `eventSpeciesLabels`.
- `src/components/events/form/EventForm.tsx`: casillas «Para qué animales (opcional)».
- `src/components/events/form/eventFormModel.ts`: `eventToFormValues` filtra los valores al editar.
- `src/components/events/EventDetail.tsx`: línea «Para: …».
- Backend: `kadesh-back/models/Pet/PetEvent/constants.ts` (`PET_EVENT_SPECIES_OPTIONS = ANIMAL_TYPE_OPTIONS`).

## Criterios de aceptación
- [ ] El formulario de evento muestra los seis tipos en orden y permite elegir varios o ninguno.
- [ ] Publicar un evento con Aves y Reptiles lo guarda, y la ficha dice «Para: Aves, Reptiles».
- [ ] Editar un evento viejo con `other` no lo marca, no lo manda y guarda sin error.
- [ ] La ficha de un evento viejo con `["dog", "other"]` dice «Para: Perros, Otros».
- [ ] Sin especies, la ficha no muestra la línea «Para:».
- [ ] Funciona en iOS y Android, en modo claro y oscuro.
